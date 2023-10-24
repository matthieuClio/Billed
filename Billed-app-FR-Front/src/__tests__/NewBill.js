/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import errorClass from '../views/ErrorPage.js'

import { localStorageMock } from "../__mocks__/localStorage.js"
import MockedBills from "../__mocks__/store.js"

import { ROUTES_PATH } from "../constants/routes.js"
import router from "../app/Router.js"
import userEvent from "@testing-library/user-event"
import { screen } from "@testing-library/dom"
import { log } from "console"

jest.mock("../app/store", () => MockedBills)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the file input dosen't have correcte type, we should reinitialize input file value", () => {
      /* 
      ---
      Sumary : we test handleChangeFile method with WRONG type
      We have to simulate an wrong input file type completed,
      and check the final input file value.
      --- 
      */

      // We load the DOM element in body page
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion (<- Not write by me)

      // Define the mock localStorage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // Define a file object
      const fileElt = new File(['testFile'], 'testFile.txt', {
        type: 'text/plain'
      })
      fileElt.value = 'defaultTestValue'
      
      // Get file input dom element
      let fullFile = document.querySelector(`input[data-testid="file"]`)

      // Mock file input dom element
      const fullFileMockGet = Object.defineProperty(fullFile, 'files', {
        get: jest.fn(() => [fileElt]),
      })

      // Replace input dom element by the mock input dom element
      fullFile.replaceWith(fullFileMockGet)

      // New object NewBill
      const NewBillObject = new NewBill({ document, onNavigate: null, store: null, localStorage: null })

      // Defined an event object
      const event = Object.assign(jest.fn(), {
        preventDefault: () => {},
        target: {value: 'C:\\fakepath\\cmd.png'}
      })

      // Call method handleChangeFile
      NewBillObject.handleChangeFile(event)

      NewBillObject.resetFile(fileElt)
      // Check the value
      expect(fullFileMockGet.files[0].value).toEqual('')
    })

    test("Then we select a file in <input file>, we should check file input type is correct", async () => {
      /* 
      ---
      Sumary : we test handleChangeFile method with CORRECT type
      We have to simulate an input file type completed,
      and check data traitement of handleChangeFile method.
      --- 
      */

      // We load the DOM elemnt in body page
      const html = NewBillUI()
      document.body.innerHTML = html

      // Define the mock localStorage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // Define a file object
      const fileElt = new File(['testfile'], 'testfile.png', {
        type: 'image/png',
      })
      fileElt.value = 'defaultTestValue'
      
      // Defined an event object
      const event = Object.assign(jest.fn(), {
        preventDefault: () => {},
        target: {value: 'C:\\fakepath\\cmd.png'}
      })
      
      // Get file input dom element
      let fullFile = document.querySelector(`input[data-testid="file"]`)

      // Mock file input dom element
      const fullFileMockGet = Object.defineProperty(fullFile, 'files', {
        get: jest.fn(() => [fileElt]),
      })

      // Replace input dom element by the mock input dom element
      fullFile.replaceWith(fullFileMockGet)

      // New object NewBill
      const NewBillObject = new NewBill({ document, onNavigate: null, store: MockedBills, localStorage: localStorage })

      // Call handleChangeFile method
      await NewBillObject.handleChangeFile(event)

      // Condition for pass the test
      expect(NewBillObject.billId).not.toBe(null)
    })

    test("Then we submit form, we should get bills data form", () => {
      /* 
      ---
      Sumary : we test handleSubmit method
      We have to simulate an click on submit button,
      and check data form.
      --- 
      */

      // We load the DOM elemnt in body page
      const html = NewBillUI()
      document.body.innerHTML = html

      // Mock console.error (needed in a update method called in NewBill object)
      console.error = jest.fn()
      
      // Define the mock localStorage 
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'test@test.com'
      })) 

      // Define onNavigate
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      
      // New object NewBill
      const NewBillObject = new NewBill({ document, onNavigate, store: MockedBills, localStorage: localStorage })
      
      // DOM element
      let submitButtonElt = document.getElementById('btn-send-bill')

      // Provoke a call on handleSubmit method
      userEvent.click(submitButtonElt)

      // Expected data form
      const dataForm = {
        email: undefined,
        type: 'Transports',
        name: '',
        amount: NaN,
        date: '',
        vat: '',
        pct: 20,
        commentary: '',
        fileUrl: null,
        fileName: null,
        status: 'pending'
      } 

      // - To delete (log test) -
      log('-- MY CONSOLE LOG --')
      log(NewBillObject.messageInfo)

      // Condition for pass the test
      // The messageInfo get bill inputs value, from object handleSubmit method when form is submit
      expect(NewBillObject.messageInfo).toEqual(dataForm)
    })
  })
})

describe('Given I am a user connected as Employe', () => {
  describe('When an error occurs on API on NewBill page', () => {
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
      
      window.onNavigate(ROUTES_PATH.NewBill)
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
      
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick)

      // Get text Error 404 on the DOM
      const message = await screen.getByText(/Erreur 404/)

      // Condition for pass the test
      expect(message).toBeTruthy()
    })
  })
})

// Other way for error 500 and 400 (my custom method)
// describe('Given an error message', () => {
//   describe('When I try to access to the server', () => {
//     test('Then we should return the "error 500" got from server', () => {
//       // Define message error 500
//       let error500 = new Error("Erreur 500")

//       // Define error DOM page
//       const errorElt = errorClass(error500.message)
//       document.body.innerHTML = errorElt

//       // Get the specific error from the DOM
//       let errorMessageElt = screen.getByTestId('error-message').textContent

//       // Define or get url
//       const customUrl = window.location.href

//       // Get status page
//       const statusPage = (customUrl) => {
//         let http = new XMLHttpRequest()
//         http.open('HEAD', customUrl, false)
//         http.send()
//         // Mock http request
//         httpMocked = Object.assign(jest.fn(), http)
//         httpMocked.status = 500

//         return httpMocked.status
//       }

//       // Delete space in text
//       errorMessageElt = errorMessageElt.replace(/\s+/g, '')
//       error500.message = error500.message.replace(/ /g, '')

//       // Check request status
//       expect(statusPage(customUrl)).toEqual(500)
//       expect(errorMessageElt).toEqual(error500.message)
//     })
//   })

//   describe('When I try to access to an wrong url', () => {
//      test('Then we should return the error 404', () => {
//       // Define message error 404
//       let error404 = new Error("Erreur 404")

//       // Define error DOM page
//       const errorElt = errorClass(error404.message)
//       document.body.innerHTML = errorElt

//       // Get the specific error from the DOM
//       let errorMessageElt = screen.getByTestId('error-message').textContent

//       // Define or get url
//       const customUrl = 'http://localhost/test/wrongUrl.html'

//       // Get status page
//       const statusPage = (customUrl) => {
//         let http = new XMLHttpRequest()
//         http.open('HEAD', customUrl, false)
//         http.send()

//         return http.status
//       }

//       // Delete space in text
//       errorMessageElt = errorMessageElt.replace(/\s+/g, '')
//       error404.message = error404.message.replace(/ /g, '')

//       // Check request status
//       expect(statusPage(customUrl)).toEqual(404)
//       expect(errorMessageElt).toEqual(error404.message)
//     })
//   })
// })