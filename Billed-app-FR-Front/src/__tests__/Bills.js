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
import MockedBills from "../__mocks__/store.js"
import errorClass from '../views/ErrorPage.js'
import { log } from "console"

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

      // Condition for pass the test
      expect(windowIcon.className).toEqual("active-icon")
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)

      // Condition for pass the test
      expect(dates).toEqual(datesSorted)
    })

    test('Then icon-eye is clicked should generate data Bill in modal', () => {
      /* 
      ---
      Sumary : we verify handleClickIconEye method from Bill object
      We simulate a click on icon eye, and we verify information
      data bill in modal.
      ---
      */

      // We load dom element on body
      document.body.innerHTML = BillsUI({ data: bills })

      // We load the bill class for use methods
      const bill = new Bill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      $.fn.modal = jest.fn() // Fix ".modal()" issue of jquery
      
      // We will make a test on this first DOM element icon eye
      const eye = screen.getAllByTestId('icon-eye')[0]

      // Simulate click on eye icon 
      // (it will call handleClickIconEye event associated to Bill constructor)
      userEvent.click(eye)

      // Get image DOM element added by the click event
      const modaleImageElt = document.querySelector('img[alt="Bill"]')

      // Check image DOM was create
      // Condition for pass the test
      expect(modaleImageElt).not.toEqual(null)
    })

    test('Then button "btn-new-bill" is clicked, should call handleClickNewBill and change url page', async () => {      
      /* 
      ---
      Sumary : we verify handleClickNewBill method from Bill object
      We simulate a click on "btn-new-bill" button, and we verify if the page url has change.
      ---
      */
      
      // We load dom element on body
      document.body.innerHTML = BillsUI({ data: bills })

      // Define root (allow to change root)
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      
      // We create an bill object event, defined in constructor will be auto load (handleClickNewBill)
      const bill = new Bill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
      
      // Check the current url
      let url = window.location.href
      expect(url).toBe('http://localhost/#employee/bills')

      // Simulate click on button, event added on button will change page
      userEvent.click(buttonNewBill)

      // New url after click on button
      url = window.location.href

      // Condition for pass the test
      expect(url).toBe('http://localhost/#employee/bill/new')
    })

    test('Then "getBills" method is call, we sould return bills', async () => {
      /* 
      ---
      Sumary : we verify getBills method from Bill object
      We verify if the bills returned is correct.
      ---
      */

      // We load dom element on body
      document.body.innerHTML = BillsUI({ data: bills })

      // We load the bill class for use his methods
      const bill = new Bill({
        document, onNavigate, store: MockedBills, localStorage: window.localStorage
      })
      
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

      // Condition for pass the test
      expect(currentMockedBillsId).toEqual(billsDataId)
    })
  })
})

describe('Given I am a user connected as Employe', () => {
  describe('When an error occurs on API on Bills page', () => {
    beforeEach(() => {
      jest.spyOn(MockedBills, "bills")
  
      // Define the mock localStorage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'test@test.com'
      })) 
    })
  
    test('Then fetches messages from an API and fails with 500 message error', async () => {
      /* 
      ---
      Sumary : verify error 500 on an call api
      We simulate a call api and return an error 500 in promise.
      --- 
      */

      // Define message error 500
      let error500 = new Error("Erreur 500")

      // Define DOM page
      const errorElt = errorClass(error500.message)
      document.body.innerHTML = errorElt

      // Allow to navigate
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()

      // Make a get on api data list
      MockedBills.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })
      
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)

      // Get text Error 500 on the DOM
      const message = await screen.getByText(/Erreur 500/)

      // Condition for pass the test
      expect(message).toBeTruthy()
    })

    test('Then fetches messages from an API and fails with 404 message error', async () => {
      /* 
      ---
      Sumary : verify error 404 on an call api
      We simulate a call api and return an error 404 in promise.
      ---
      */

      // Define message error 404
      let error404 = new Error("Erreur 404")

      // Define DOM page
      const errorElt = errorClass(error404.message)
      document.body.innerHTML = errorElt

      // Allow to navigate
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()

      // Make a get on api data list
      MockedBills.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
      
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick)

      // Get text Error 404 on the DOM
      const message = await screen.getByText(/Erreur 404/)

      // Condition for pass the test
      expect(message).toBeTruthy()
    })
  })
})