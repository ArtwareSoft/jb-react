aa_lmcApi_registerPlugin({
    id: 'ExternalDoc',
    title: 'External Html Documnet',
    agent: {
        xtml: `<Field t="control.PropertySheet" ID="_ps1" Title="Property Sheet">
    <Style t="properties.LMCDialogPropertySheet"/>
    <Field t="fld.Field" FieldData="%!@docId%" ID="docId" Title="Document Id">
      <FieldType t="fld_type.EditableText">
        <Style t="editable_text.LMCTextbox" Width="354px"/>
      </FieldType>
      <FieldAspect t="field_aspect.DefaultValue" Value="doc1"/>
    </Field>
    <Field t="fld.Field" ID="_externalDocFld" Title="Paste document here">
      <FieldType t="fld_type.EditableText">
        <Style t="editable_text.NicEdit" Buttons="save,bold,italic,underline,left,center,right,justify,ol,ul,fontSize,fontFamily,fontFormat,indent,outdent,image,upload,link,unlink,forecolor,bgcolor" Height="150" Width="600">&#xa;                          </Style>
      </FieldType>
    </Field>
    <Field t="control.CustomControl" ID="_externalRawHtml" Title="Paste raw Html here">
      <Control t="ui.CustomStyle">
        <Html><![CDATA[<textarea/>]]></Html>
        <Css><![CDATA[#this { height: 40px;  width: 595px;}]]></Css>
      </Control>
    </Field>
  </Field>`,
      js(object,settingsRef) {
          const data = [object.Data[0].parentElement];
          const context = object.Context;
          const publicUrl = ajaxart.totext(ajaxart.dynamicText(data,'%@publicUrl%',context)[0]);
          if (publicUrl) // show the html to the user
              fetch(publicUrl + '?cachekill=' + Math.floor(Math.random() *10000))
                  .then(function(x) { return x.text() })
                  .then(function(txt) { 
                      const text = decodeURIComponent(txt)
                         document.querySelector('.fld__externalRawHtml').value = text
                         document.querySelector('.fld__externalDocFld').jbNicEditorInstance.setContent(text)
                  })
                  .catch(function(err) {
                      aa_lmcApi_ServerErrorLog('upload_file','Failed to upload file',err || '');
                  })
      },
      onClose(object) {
          const data = [object.Data], context = object.Context
          if (document.querySelector('.fld__externalDocFld').jbNicEditorInstance.getContent() == '<br>')
            document.querySelector('.fld__externalDocFld').jbNicEditorInstance.setContent('')
          const content = document.querySelector('.fld__externalDocFld').jbNicEditorInstance.getContent() 
            || document.querySelector('.fld__externalRawHtml').value
          const docId = ajaxart.totext(ajaxart.dynamicText(data,"%@docId%",context))
          if (!docId) {
          	alert('please enter Document Id');
          	return
          }
          const otherDocIds = ajaxart.dynamicText(data,"%$Room/items/paragraph[@docId='{@docId}']%",context)
          if (otherDocIds.length > 1) {
          	ajaxart.run(data,aa_parsexml('<action t="action.WriteValue" To="%!@docId%" Value=""/>'),'',context);
          	alert('Document ' + docId + ' already exists, please choose a different one');
          	return
          }
  
          const fileName = ajaxart.totext(ajaxart.dynamicText(data,'%$Room/@id%-%@docId%.html',context));
          var waitCursorCss = aa_attach_global_css("#this { cursor:wait !important; }");
          $('body').addClass(waitCursorCss);
          aa_lmcApi_saveFileWithPost({
              project: aa_lmc_projectID(context),
              key: aa_lmc_projectKey(context),
              file: fileName,
              content: encodeURIComponent(content),
              contentType: 'text/html'
          }).done(function(result) {
              $('body').removeClass(waitCursorCss);
              var publicUrl = aa_lmcApi_getFileUrl(aa_lmc_projectID(context),fileName);
              ajaxart.run(data,aa_parsexml('<action t="action.WriteValue" To="%!@publicUrl%" Value="' + publicUrl +'"/>'),'',context);
          }).fail(function(err) {
              $('body').removeClass(waitCursorCss);
              aa_lmcApi_ServerErrorLog('upload_file','Failed to upload file',err || '');
          });
      },
      html: '',
      css: `#this .aa_property_title { color: #666 !important; }`,
      defaultWidgetData: '',
      files: []
  },
  summaryLabel: {
      html: '<div>%@docId%</div>',
      css: '#this {overflow:hidden; font:12px Arial Black, Gadget, sans-serif; }', 
  },
  visitor: {
      js(object,data) {
      },
      html: '',
      css: ''
  },   
  })
  
  aa_lmcApi_registerPlugin({
    id: 'InnerLinkToDoc',
    title: 'Link To External Doc',
    agent: {
        xtml: `<Field t="control.PropertySheet" ID="_ps1" Title="Property Sheet">
    <Style t="properties.LMCDialogPropertySheet"/>
    <Field t="fld.Field" FieldData="%!@externalDocId%" ID="docId" Title="Document Id">
        <FieldType t="fld_type.Picklist" AllowEmptyValue="" AllowValueNotInOptions="">
            <Options t="editable_picklist.DynamicOptions" OptionCode="%%" OptionDisplayName="%%"  Options="%$Room/items/paragraph/@docId%"/>
            <Style t="editable_picklist.LMCPicklist" Width="354px"/>
        </FieldType>
    </Field>
    <Field t="fld.Field" FieldData="%!@textToJumpTo%" ID="TxtToJump" Title="Jump to text">
      <FieldType t="fld_type.EditableText">
        <Style t="editable_text.LMCTextbox" Width="354px"/>
      </FieldType>
    </Field>
    <Field t="fld.Field" FieldData="%!@occurance%" ID="occurance" Title="Occurance">
      <FieldType t="fld_type.EditableText">
        <Style t="editable_text.LMCTextbox" Width="354px"/>
      </FieldType>
      <FieldAspect t="field_aspect.DefaultValue" Value="1"/>
    </Field>
    <Field t="fld.Field" FieldData="%!@css%" ID="LinkToDocheight" Title="Css">
      <FieldType t="fld_type.EditableText">
        <Style t="editable_text.LMCTextbox" Width="354px"/>
      </FieldType>
      <FieldAspect t="field_aspect.DefaultValue" Value="height: 400px;"/>
    </Field>
  </Field>`,
      js(object,settingsRef) {
      },
      onClose(object) {
      },
      html: '',
      css: '#this .aa_property_title { color: #666 !important; }',
      defaultWidgetData: '',
      files: []
  },
  summaryLabel: {
      html: '<div>%@externalDocId% : %@textToJumpTo%</div>',
      css: '#this {overflow:hidden; font:12px Arial Black, Gadget, sans-serif; margin-left: -24px;}', 
  },
  visitor: {
      js(object,_data) {
          const data = [object.Data[0].parentElement];
          const context = object.Context;
          const url = ajaxart.dynamicText(data,"%$Room/items/paragraph[@docId='{@externalDocId}']/@publicUrl%",context);
          const textToJumpTo = ajaxart.totext(ajaxart.dynamicText(data,"%@textToJumpTo%",context))
          const occ = +ajaxart.totext(ajaxart.dynamicText(data,"%@occurance%",context))
          const publicUrl = ajaxart.totext(url) + '?cachekill=' + Math.floor(Math.random() *10000);
          if (publicUrl) fetch(publicUrl)
                  .then(function(x) { return x.text() })
                  .then(function(txt) { 
                      const html = decodeURIComponent(txt)
                      var nth = 0;
                      const escapedRegex = new RegExp(textToJumpTo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),'g')
                      const fixedHtml = html.replace(escapedRegex, function (match, i, original) {
                          nth++;
                          return (nth === occ) ? '<span id="jumpPlace">' + match + '</span>' : match;
                      });
                      object.el.innerHTML = fixedHtml
                      const elemToJmp = object.el.querySelector('#jumpPlace')
                      elemToJmp && elemToJmp.scrollIntoView()
                  })
                  .catch(function(err) {
                      aa_lmcApi_ServerErrorLog('upload_file','Failed to upload file',err || '');
                  })
          function jumpToText(html,el) {
          }
      },
      html: '<div class="frame-link-to-doc"></div>',
      css: '#this {overflow-y: scroll; %@css% }'
  },   
})

aa_lmcWidget_externalDoc = true

