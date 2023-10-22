import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"

import Actions from './Actions.js'

const row = (bill) => {
  return (`
    <tr>
      <td>${bill.type}</td>
      <td>${bill.name}</td>
      <td>${bill.date}</td>
      <td>${bill.amount} €</td>
      <td>${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl)}
      </td>
    </tr>
    `)
}

const rows = (data) => {

  // Define bills order by date
  // --------------------------
  
  // If the code is executed with data
  if (data != undefined) {
    
    // Variable
    let highestDate = new Date(0)
    let billsOrdered = []
    let dataFirstCopy = []
    let dataSecondCopy = []
    let elementHighest
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    // Define two copy of data
    data.forEach((element) => {
      dataFirstCopy.push(element)
      dataSecondCopy.push(element)
    })

    // Push highest number in a new array billsOrdered
    for (let i = 0; data.length > i; i++) {
      
      // Define the hightest date
      for (let e = 0; dataSecondCopy.length > e; e++) {

        // Convert date to Fr
        let currentDataDate = new Date(dataSecondCopy[e].date).toLocaleDateString('fr-FR', options)
        let curenteHighestDate = new Date(highestDate).toLocaleDateString('fr-FR', options)

        // Compare the currente data date and the most hightest date
        if (new Date(currentDataDate).getTime() >= new Date(curenteHighestDate).getTime()) {
          
          // Get the highest date
          highestDate = dataSecondCopy[e].date
          // Get the element by hightest date
          elementHighest = dataFirstCopy[e]
        }
      }

      // Get the index of the highest date
      let indexBills = dataFirstCopy.indexOf(elementHighest)

      // Add the highest number in the new array
      billsOrdered.push(elementHighest)

      // Delete the element for the futur comparaison
      dataSecondCopy.splice(indexBills, 1)
      dataFirstCopy.splice(indexBills, 1)

      // Not be empty
      if (dataSecondCopy.length > 0) {
        highestDate = 0
      }
    }
    
    // Define the new bills order
    data = billsOrdered
  }
  
  // Other way to proced
  // return (data && data.length) ? data.sort((a, b) => ((Date.parse(a.date) < Date.parse(b.date)) ? 1 : -1)).map(bill => row(bill)).join("") : ""
  return (data && data.length) ? data.map(bill => row(bill)).join("") : ""
}

export default ({ data: bills, loading, error }) => {

  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }
  
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`
  )
}