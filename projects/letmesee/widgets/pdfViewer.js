aa_lmcApi_registerPlugin({
    id: 'PDFViewer',
    title: 'PDF Viewer',
    agent: {
        xtml: `<Field t="control.PropertySheet" ID="_ps1" Title="Property Sheet">
    <Style t="properties.LMCDialogPropertySheet"/>
    <Field t="fld.Field" FieldData="%!@pdfUrl%" ID="pdfUrl" Title="PDF URL. E.g: https:// ..">
      <FieldType t="fld_type.EditableText">
        <Style t="editable_text.LMCTextbox" Width="354px"/>
      </FieldType>
      <FieldAspect t="field_aspect.DefaultValue" Value="doc1"/>
    </Field>
    <Field t="fld.Field" FieldData="%!@pdfPage%" ID="pdfPage" Title="Goto Page">
      <FieldType t="fld_type.EditableText">
        <Style t="editable_text.LMCTextbox" Width="354px"/>
      </FieldType>
    </Field>
    <Field t="fld.Field" FieldData="%!@pdfName%" ID="pdfName" Title="Optional - PDF Document Name">
      <FieldType t="fld_type.EditableText">
        <Style t="editable_text.LMCTextbox" Width="354px"/>
      </FieldType>
    </Field>
    <Field t="fld.Field" FieldData="%!@pdfHeight%" ID="pdfHeight" Title="Height. E.g. 200px, 100%">
      <FieldType t="fld_type.EditableText">
        <Style t="editable_text.LMCTextbox" Width="354px"/>
      </FieldType>
      <FieldAspect t="field_aspect.DefaultValue" Value="600px"/>
    </Field>
  </Field>`,
  },
  summaryLabel: {
      html: '<div>PDF %@pdfName%</div>',
      css: '#this {overflow:hidden; font:12px Arial Black, Gadget, sans-serif; max-width: 100px}', 
  },
  visitor: {
      html: '<iframe src="https://mozilla.github.io/pdf.js/web/viewer.html' +
          '?file=%@pdfUrl%" height="%@pdfHeight%" width="100%"></iframe>',
      css: ''
  },
})
//tb = window.PDFViewerApplication.toolbar
// tb.eventBus.dispatch("pagenumberchanged", { source: tb, value: 2 })
aa_lmcWidget_pdfViewer = true

