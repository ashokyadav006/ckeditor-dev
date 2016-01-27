(function () {
    //var zws = '\u200B';
    //var AcroData;
    var acronym = function (editor) {
        return {
            title: 'Add variable',
            id: 'variableValue',
            minWidth: 300,
            minHeight: 100,
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
                                    label: 'Variable',
                                    labelLayout: 'horizontal',
                                    validate: CKEDITOR.dialog.validate.notEmpty('You did not fill in an variable!'),
                                    setup: function(widget) {
                                        this.setValue(widget.data.acroText);
                                    },
                                    commit: function(widget) {
                                        widget.setData('acroText', this.getValue());
                                    }
                                }]
                        }]
                }]
        };
    };

    CKEDITOR.dialog.add('acronym', function (editor) {
        return acronym(editor);
    });
})();
