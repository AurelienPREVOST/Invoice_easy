import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import fakeLogo from "./assets/fakeLogo.png";

const fakeSiren = '123456789';
const fakeAddress = '55 Rue du Faubourg Saint-Honoré, 75008 Paris';
const fakeInvoiceNumber = 'INV-2024021901';

function App() {
  const [items, setItems] = useState([]);
  const [object, setObject] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [tva, setTva] = useState('');
  const [totalHT, setTotalHT] = useState(0);
  const [totalTVA, setTotalTVA] = useState(0);
  const [totalTTC, setTotalTTC] = useState(0);
  const [previewPDF, setPreviewPDF] = useState(null);


  const addItem = () => {
    const newItem = {
      object,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      tva: parseFloat(tva),
      subtotal: parseFloat(price) + (parseFloat(price) * parseFloat(tva) / 100),
    };

    setItems([...items, newItem]);
    generatePreviewPDF();
    clearForm();
  };

  const updateTotal = () => {
    if (items.length > 0) {
      const totalHT = items.reduce((sum, item) => sum + parseFloat(item.price), 0);
      setTotalHT(totalHT.toFixed(2));

      const totalTVA = items.reduce((sum, item) => sum + (parseFloat(item.price) * parseFloat(item.tva) / 100), 0);
      setTotalTVA(totalTVA.toFixed(2));

      const totalTTC = totalHT + totalTVA;
      setTotalTTC(totalTTC.toFixed(2));
    } else {
      setTotalHT('0.00');
      setTotalTVA('0.00');
      setTotalTTC('0.00');
    }
  };

  const removeItem = (index) => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?");
  
    if (isConfirmed) {
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      setItems(updatedItems);
  
      updateTotal();
    }
  };
  

  useEffect(() => {
    updateTotal();
    console.log("items=>", items);
  }, [items]);

  const clearForm = () => {
    setObject('');
    setQuantity('');
    setPrice('');
    setTva('');
  };

  const generatePDF = () => {
    updateTotal();

    const pdf = new jsPDF();

    pdf.setFontSize(16);
    pdf.text('FACTURE', 20, 15);
    pdf.setFontSize(12);
    pdf.text('Facture numero: ' + fakeInvoiceNumber, 20, 25);

    pdf.text('Emetteur:', 20, 40);
    pdf.text(fakeAddress, 20, 50);

    pdf.addImage(fakeLogo, 'JPEG', 160, 10, 50, 50);

    const tableColumn = ['Reference', 'Quantité', 'Prix ht', 'TVA%', 'Sous-total ttc'];
    
    const tableRows = items.map(item => [item.object, item.quantity, item.price, item.tva, item.subtotal.toFixed(2)]);

    pdf.autoTable(tableColumn, tableRows, { startY: 80 });

    pdf.text('Total HT: ' + totalHT, 20, pdf.autoTable.previous.finalY + 10);
    pdf.text('TVA: ' + totalTVA, 20, pdf.autoTable.previous.finalY + 18);
    pdf.text('Total TTC: ' + totalTTC, 20, pdf.autoTable.previous.finalY + 26);

    pdf.text('SIREN: ' + fakeSiren, 20, pdf.internal.pageSize.height - 20);
    pdf.text('Adresse: ' + fakeAddress, 20, pdf.internal.pageSize.height - 10);

    pdf.save(`invoice${fakeInvoiceNumber}.pdf`);

    clearForm();
  };


  const generatePreviewPDF = () => {
    const pdfPreview = new jsPDF();

    generatePDFContent(pdfPreview);

    setPreviewPDF(pdfPreview);
  };

  const generatePDFContent = (pdf) => {
    pdf.setFontSize(16);
    pdf.text('FACTURE', 20, 15);
    pdf.setFontSize(12);
    pdf.text('Facture numero: ' + fakeInvoiceNumber, 20, 25);

    pdf.text('Emetteur:', 20, 40);
    pdf.text(fakeAddress, 20, 50);

    pdf.addImage(fakeLogo, 'JPEG', 160, 10, 50, 50);

    const tableColumn = ['Reference', 'Quantité', 'Prix ht', 'TVA%', 'Sous-total ttc'];

    const tableRows = items.map(item => [item.object, item.quantity, item.price, item.tva, item.subtotal.toFixed(2)]);

    pdf.autoTable(tableColumn, tableRows, { startY: 80 });

    pdf.text('Total HT: ' + totalHT, 20, pdf.autoTable.previous.finalY + 10);
    pdf.text('TVA: ' + totalTVA, 20, pdf.autoTable.previous.finalY + 18);
    pdf.text('Total TTC: ' + totalTTC, 20, pdf.autoTable.previous.finalY + 26);

    pdf.text('SIREN: ' + fakeSiren, 20, pdf.internal.pageSize.height - 20);
    pdf.text('Adresse: ' + fakeAddress, 20, pdf.internal.pageSize.height - 10);
  };



  return (
  <>
    <div className="invoice-form">
      <h1>Générer une facture</h1>

      <label htmlFor="object">Référence/SKU:</label>
      <input type="text" id="object" value={object} onChange={e => setObject(e.target.value)} required /><br />

      <label htmlFor="quantity">Quantité:</label>
      <input type="number" id="quantity" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} required /><br />

      <label htmlFor="price">Prix:</label>
      <input type="number" id="price" min="0.01" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required /><br />

      <label htmlFor="tva">TVA (%):</label>
      <input type="number" id="tva" min="0" step="0.01" value={tva} onChange={e => setTva(e.target.value)} required /><br />

      <button type="button" onClick={addItem}>Ajouter une ligne</button>

      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.object} - Quantité: {item.quantity}, Prix: {item.price}, TVA: {item.tva}%, Sous-total: {item.subtotal.toFixed(2)}
            <span className="removebtn" type="button" onClick={() => removeItem(index)}>
              X
            </span>
          </li>
        ))}
      </ul>

      <label htmlFor="totalHT">Total HT:</label>
      <input type="text" id="totalHT" value={totalHT} readOnly /><br />

      <label htmlFor="totalTVA">TVA:</label>
      <input type="text" id="totalTVA" value={totalTVA} readOnly /><br />

      <label htmlFor="totalTTC">Total TTC:</label>
      <input type="text" id="totalTTC" value={totalTTC} readOnly /><br />

      <button type="button" onClick={generatePDF}>Éditer la facture</button>
    </div>
    <div className="pdf-preview">
      <h2>Prévisualisation du PDF</h2>
      {previewPDF   && (
      <iframe
        title="PDF Preview"
        width="500"
        height="800"
        src={previewPDF.output('datauristring')}
      />
      )}
    </div>
  </>
  );
}

export default App;
