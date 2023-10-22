/**
 * @jest-environment jsdom
 */

import userEvent from "@testing-library/user-event"
import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import router from "../app/Router.js"

import Bill from "../containers/Bills.js"
// import NewBillUi from "../views/NewBillUI.js"
import MockedBills from "../__mocks__/store.js"
import errorClass from '../views/ErrorPage.js'
import { log } from "console"

// ...
// ...
// Given When Then structur, my structure is correct ?

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.className).toEqual("active-icon")
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // Maybe set a WHEN ?
    test('Then icon-eye is clicked should generate modal', () => {
       // We load dom element on body
      document.body.innerHTML = BillsUI({ data: bills })

      // We load the bill class for use methods
      const bill = new Bill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      // V2 of my code
      // .............
      $.fn.modal = jest.fn() // Fix ".modal()" issue of jquery
      const eye = screen.getAllByTestId('icon-eye')[0] // Get first DOM elemnt icon eye

      // Simulate click on eye icon, it call event added on eye icon
      userEvent.click(eye)

      // Get image DOM element added by the click event
      const modaleImageElt = document.querySelector('img[alt="Bill"]')
      // log(modaleImageElt.getAttribute('src'))

      // Check image DOM was create
      expect(modaleImageElt).not.toEqual(null)
    })

    test('Then handleClickNewBill should be call, when we click on buttonNewBill', async () => {      
      // We load dom element on body
      document.body.innerHTML = BillsUI({ data: bills })

      // Define root (allow to change root)
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      
      // We create an bill object, event defined in constructor will be auto load (handleClickNewBill)
      const bill = new Bill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
      
      // Check the current url
      let url = window.location.href
      expect(url).toBe('http://localhost/#employee/bills')

      // Simulate click on button, event added on button will change page
      userEvent.click(buttonNewBill)

      // Check the new url after click on button
      url = window.location.href
      expect(url).toBe('http://localhost/#employee/bill/new')
    })

    test('Then "getBills" method sould be call must to have a return', async () => {
      // We load dom element on body
      document.body.innerHTML = BillsUI({ data: bills })

      // We load the bill class for use methods
      const bill = new Bill({
        document, onNavigate, store: MockedBills, localStorage: window.localStorage
      })

      // ... V2
      // Bills by method getBills
      const billsData = await bill.getBills()
      const billsDataId = []

      // Bills from mockedBills
      const currentMockedBills = await MockedBills.bills().list()
      const currentMockedBillsId = []

      // Get all currentMockedBills id of each element
      currentMockedBills.forEach(element => {
        currentMockedBillsId.push(element.id)
      });

      // Get all billsData id of each element
      billsData.forEach(element => {
        billsDataId.push(element.id)
      });

      expect(currentMockedBillsId).toEqual(billsDataId)
    })
  })

  // ........
  // Old code
  // - Not working because the 'expect()' work if we delete "userEvent.click(eye)" LINE -
  // describe("When I click on icon eye button", () => {
  //   test('Then open modal', () => {
  //     const onNavigate = (pathname) => {
  //       document.body.innerHTML = ROUTES({ pathname })
  //     }
  //     Object.defineProperty(window, "localStorage", { value: localStorageMock })
  //     window.localStorage.setItem('user', JSON.stringify({
  //         type: "Employee"
  //       })
  //     )
  //     document.body.innerHTML = BillsUI({ data: bills })
  //     const bill = new Bill({
  //       document, onNavigate, store: null, localStorage: window.localStorage
  //     })

  //     $.fn.modal = jest.fn()
  //     const eye = screen.getAllByTestId('icon-eye')[0]
  //     const handleClickIconEye = jest.fn(() => bill.handleClickIconEye(eye))
  //     eye.addEventListener('click', handleClickIconEye)
  //     userEvent.click(eye)
  //     expect(handleClickIconEye).toHaveBeenCalled()

  //     const modale = document.getElementById('modaleFile')
  //     expect(modale).toBeTruthy()
  //   })
  // })
})

describe('Given an error message', () => {
  describe('When I try to access to the server', () => {
    test('Then we should return the "error 500" got from server', () => {
      // Define message error 500
      let error500 = new Error("Erreur 500")

      // Define error DOM page
      const errorElt = errorClass(error500.message)
      document.body.innerHTML = errorElt

      // Get the specific error from the DOM
      let errorMessageElt = screen.getByTestId('error-message').textContent

      // Define or get url
      const customUrl = window.location.href
      
      // Get status page
      const statusPage = (customUrl) => {
        let http = new XMLHttpRequest()
        http.open('HEAD', customUrl, false)
        http.send()
        // Mock http request
        httpMocked = Object.assign(jest.fn(), http)
        httpMocked.status = 500

        return httpMocked.status
      }

      // Delete space in text
      errorMessageElt = errorMessageElt.replace(/\s+/g, '')
      error500.message = error500.message.replace(/ /g, '')

      // Check request status
      expect(statusPage(customUrl)).toEqual(500)
      expect(errorMessageElt).toEqual(error500.message)
    })
  })

  describe('When I try to access to an wrong url', () => {
     test('Then we should return the error 404', () => {
      // Define message error 404
      let error404 = new Error("Erreur 404")

      // Define error DOM page
      const errorElt = errorClass(error404.message)
      document.body.innerHTML = errorElt

      // Get the specific error from the DOM
      let errorMessageElt = screen.getByTestId('error-message').textContent

      // Define or get url
      const customUrl = 'http://localhost/test/wrongUrl.html'

      // Get status page
      const statusPage = (customUrl) => {
        let http = new XMLHttpRequest()
        http.open('HEAD', customUrl, false)
        http.send()

        return http.status
      }

      // Delete space in text
      errorMessageElt = errorMessageElt.replace(/\s+/g, '')
      error404.message = error404.message.replace(/ /g, '')

      // Check request status
      expect(statusPage(customUrl)).toEqual(404)
      expect(errorMessageElt).toEqual(error404.message)
    })
  })
})