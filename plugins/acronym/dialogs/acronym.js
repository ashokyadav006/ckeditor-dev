(function () {
    var zws = '\u200B';
    var AcroData;
    var acronym = function (editor) {
        return {
            title: 'Add acronym',
            id: 'acronymValue',
            minWidth: 300,
            minHeight: 100,
            buttons: [CKEDITOR.dialog.okButton, CKEDITOR.dialog.cancelButton],
            onOk: function () {
                    var acronymText = this.getValueOf('general', 'acronymText');
                    var acrospan = editor.document.createElement('span');
                    var selectedElement = editor.getSelection().getStartElement().getName();
                    if(selectedElement!=='a') {
                        acrospan.setAttribute('id', 'var_acronym');
                        acrospan.setAttribute('style', 'color:rgb(236, 27, 82)');
                        acrospan.setAttribute('var', acronymText );
                        acrospan.setAttribute('contenteditable', 'false' );
                        //acrospan.setText(zws +'[' + acronymText + ']'+zws);
                        acrospan.setText('[' + acronymText + '] ');
                        editor.insertElement(acrospan);
                    }

            },
            onLoad: function () {
                dialog = this;
                this.setupContent();
            },
            onShow: function () {

            },
            onHide: function () {
            },
            onCancel: function () {
            },
            onChange: function () {
            },
            resizable: CKEDITOR.DIALOG_RESIZE_NONE,
            contents: [{
                    id: 'general',
                    label: 'General',
                    accessKey: 'G',
                    elements: [{
                            type: 'vbox',
                            children: [{
                                    type: 'text',
                                    id: 'acronymText',
                                    label: 'Acronym',
                                    labelLayout: 'horizontal',
                                    validate: CKEDITOR.dialog.validate.notEmpty('You did not fill in an acronym!'),
                                    onCommit: function () {}
                                }]
                        }]
                }]
        }
    }

    CKEDITOR.dialog.add('acronym', function (editor) {
        return acronym(editor);
    });
})();
