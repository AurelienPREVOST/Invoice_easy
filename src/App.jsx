import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import fakeLogo from "./assets/fakeLogo.png";

const fakeSiren = '123456789';
const fakeAddress = '55 Rue du Faubourg Saint-Honoré, 75008 Paris';
const fakeInvoiceNumber = 'INV-2024021901';

const initialFormData = {
  object: '',
  quantity: '',
  price: '',
  tva: '',
};

const App = () => {
  const [isInvoiceChecked, setIsInvoiceChecked] = useState(true);
  const [isEstimateChecked, setIsEstimateChecked] = useState(false);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [totals, setTotals] = useState({
    totalHT: '0.00',
    totalTVA: '0.00',
    totalTTC: '0.00',
  });
  const [previewPDF, setPreviewPDF] = useState(null);  


  // ENSEMBLE DES USE EFFECT
  useEffect(() => updateTotal(), [items]);
  useEffect(() => generatePreviewPDF(), [totals, items, isInvoiceChecked]);


  // AJOUTER UNE LIGNE
  const addItem = () => {
    console.log("passe par addItem()")
    // Vérifier si les champs obligatoires sont remplis
    if (!formData.object || formData.quantity === '' || formData.price === '' || formData.tva === '') {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    // Vérifier si les valeurs sont numériques
    if (isNaN(parseFloat(formData.quantity)) || isNaN(parseFloat(formData.price)) || isNaN(parseFloat(formData.tva))) {
      alert('Veuillez saisir des valeurs numériques valides.');
      return;
    }
    const newItem = {
      object: formData.object,
      quantity: parseFloat(formData.quantity),
      price: parseFloat(formData.price),
      tva: parseFloat(formData.tva),
      subtotal: parseFloat(formData.price*formData.quantity) + (parseFloat(formData.price*formData.quantity) * parseFloat(formData.tva) / 100),
    };
    setItems([...items, newItem]);
    generatePreviewPDF();
    clearForm();
  };

  // MISE A JOUR DU TOTAL DES PRIX 
  const updateTotal = () => {
    console.log("passe par updateTotal()")
    if (items.length > 0) {
      const totalHT = items.reduce((sum, item) => sum + parseFloat(item.price*item.quantity), 0);
      const totalTVA = items.reduce((sum, item) => sum + (parseFloat(item.price*item.quantity) * parseFloat(item.tva) / 100), 0);
      const totalTTC = totalHT + totalTVA;
      setTotals({
        totalHT: totalHT.toFixed(2),
        totalTVA: totalTVA.toFixed(2),
        totalTTC: totalTTC.toFixed(2),
      });
    } else {
      setTotals({
        totalHT: '0.00',
        totalTVA: '0.00',
        totalTTC: '0.00',
      });
    }
  };

  // SUPPRIMER UNE LIGNE
  const removeItem = (index) => {
    console.log("passe par removeItem()")
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?");
    if (isConfirmed) {
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      setItems(updatedItems);
      updateTotal();
    }
  };

  // SWITCHé DE FACTURE A DEVIS
  const toggleInvoiceType = () => {
    console.log("passe par toggleInvoiceType()")
    setIsInvoiceChecked(!isInvoiceChecked);
    setIsEstimateChecked(!isEstimateChecked);
  };

  // VIDER LE FORMULAIRE (après chaque ligne ajouté)
  const clearForm = () => {
    console.log("passe par cleanForm()")
    setFormData(initialFormData);
  };

  //Formatage de la date en DD/MM/YYYY
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // GENERATION PARTAGE ET CONSTITUTION DU PDF (QUE CE SOIT POUR LA PREVIEW OU POUR L'EXTRACTION PDF)
  const generateCommonContent = (pdf) => {
    console.log("passe par generateCommonContent()");
    pdf.setFontSize(16);
    pdf.text(isInvoiceChecked ? 'FACTURE' : 'DEVIS', 20, 15);
  
    pdf.setFontSize(12);
    pdf.text('REF: ' + fakeInvoiceNumber, 20, 25);
  
    pdf.setFontSize(12);
    const formattedDate = formatDate(new Date());
    pdf.text("Date d'émission: " + formattedDate, 20, 30);
  
    pdf.text('Emetteur:', 20, 45);
    pdf.text(fakeAddress, 20, 50);
  
    pdf.addImage(fakeLogo, 'JPEG', 160, 10, 50, 50);
  
    const tableColumn = ['Reference', 'Quantité', 'Prix ht', 'TVA%', 'Sous-total ttc'];
    const tableRows = items.map(item => [item.object, item.quantity, item.price, item.tva, item.subtotal.toFixed(2)]);
  
    pdf.autoTable(tableColumn, tableRows, { startY: 80 });
  
    pdf.text('Total HT: ' + totals.totalHT, 20, pdf.autoTable.previous.finalY + 10);
    pdf.text('TVA: ' + totals.totalTVA, 20, pdf.autoTable.previous.finalY + 18);
    pdf.text('Total TTC: ' + totals.totalTTC, 20, pdf.autoTable.previous.finalY + 26);
  
    pdf.text('SIREN: ' + fakeSiren, pdf.internal.pageSize.width / 2, pdf.internal.pageSize.height - 20, { align: 'center' });
    pdf.text('Adresse: ' + fakeAddress, pdf.internal.pageSize.width / 2, pdf.internal.pageSize.height - 10, { align: 'center' });
  };
  

  // GENERE LE PDF EN FICHIER EXTERNE
  const generatePDF = () => {
    console.log("passe par generatePDF()");
    updateTotal();
    if (totals.totalTTC <= 0 && totals.totalHT <= 0) {
      alert('La facture/devis est vide');
      return;
    }
    const pdf = new jsPDF();
    generateCommonContent(pdf);
    pdf.save(`invoice${fakeInvoiceNumber}.pdf`);
    clearForm();
  };


    // GENERATION DE LA PREVISUALISATION
  const generatePreviewPDF = () => {
    console.log("passe par generatePreviewPDF()")
    const pdfPreview = new jsPDF();
    generateCommonContent(pdfPreview);
    setPreviewPDF(pdfPreview);
  };


  return (
    <>
      {/* FORMULAIRE DE SAISI*/}
      <div className="invoice-form">
        <h1>Générer {isInvoiceChecked ? 'une facture' : 'un devis'}</h1>
        {/* BOUTON SWITCH */}
        <div className="switch-container">
          <label className="switch">
            <input type="checkbox" checked={isInvoiceChecked} onChange={toggleInvoiceType} />
            <span className="slider round"></span>
          </label>
        </div>
        {Object.entries(formData).map(([key, value]) => (
          <div key={key}>
            <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
            {key === 'quantity' ? (
              <input type="number" id={key} min="1" value={value} onChange={e => setFormData({ ...formData, [key]: e.target.value })} required />
            ) : (
              <input type="text" id={key} value={value} onChange={e => setFormData({ ...formData, [key]: e.target.value })} required />
            )}
            <br />
          </div>
        ))}
        <button type="button" onClick={addItem}>Ajouter une ligne</button>
        {/* PREVIEW DES SOUS TOTAUX EN BAS DE FORMULAIRE */}
        {Object.entries(totals).map(([key, value]) => (
          <div key={key}>
            <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
            <input type="text" id={key} value={value} readOnly />
            <br />
          </div>
        ))}
        <button type="button" onClick={generatePDF}>Éditer la facture</button>
      </div>
      {/* PREVISUALISATION INLINE*/}
      <div id="inline-preview">
        <h2>Prévisualisation des lignes</h2>
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              <span className="removebtn" type="button" onClick={() => removeItem(index)}>
                X
              </span>
              {item.object} - Quantité: {item.quantity}, Prix: {item.price}, TVA: {item.tva}%, Sous-total: {item.subtotal.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
      {/* PREVISUALISATION PDF*/}
      <div className="pdf-preview">
        <h2>Prévisualisation du PDF</h2>
        {previewPDF && (
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
};

export default App;
