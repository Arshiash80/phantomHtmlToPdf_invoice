const fs = require('fs')
const conversion = require("phantom-html-to-pdf")();
const path = require('path')
const utils = require('util')
const readFile = utils.promisify(fs.readFile)
const ejs = require('ejs')

let data = { // Dummy data 
  address: {
      restaurantName: "Bilmem ne restorani",
      specification: "bilmem ne sokak / bilmem nemahallesi",
      postcode: "123456"
  },
  invoice: {
      date: "02/01/2021",
      no: "1001"
  },
  wasteOil: {
      code: "123213213123",
      liters: "20",
      payment: 999.81
  },
  barrelSizesList: [
      5,10,100
  ],
  productsList: [
      "bu yag","su yag","az yag"
  ],
  qtyList: [
      1,4,1
  ],
  priceList: [
      10, 19, 88.77
  ],
  totalPrice: 999
};

async function getInvoiceTemplate() {
    console.log("Loading template file in memory")
    try {
        const invoicePath = path.resolve("./assets/invoiceTemplate.ejs"); // Invoice template path.
        return await readFile(invoicePath, 'utf8');
    } catch (err) {
        return Promise.reject("Could not load html template. ERROR: \n", err);
    }
}


getInvoiceTemplate()
    .then(async (res) => {
        console.log("Compiling the template with ejs")
        const ejsTemplate = ejs.compile(res);
        // we have compile our code with ejs
        const result = ejsTemplate(data);
        // We can use this to add dyamic data to our ejs template at run time from database or API as per need.
        const html = result;
        console.log(result)
        // we are using ejs mode 


        conversion({ 
            html: html,
            paperSize: {
                format: 'A4',
                fitToPage:true
            } 
        }, function(err, pdf) {
            if (err ) { throw err }
            const output = fs.createWriteStream(path.join(__dirname, "output.pdf"))
            console.log(pdf.logs);
            console.log(pdf.numberOfPages);
            // since pdf.stream is a node.js stream you can use it
            // to save the pdf to a file (like in this example) or to
            // respond an http request.
            pdf.stream.pipe(output);
            return "Done!!!"
        });
    })


