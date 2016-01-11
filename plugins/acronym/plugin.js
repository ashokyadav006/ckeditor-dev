CKEDITOR.plugins.add('acronym', {
    requires: 'widget',
    init: function (editor) {
        var pluginName = 'acronym';

        CKEDITOR.dialog.add(pluginName, this.path + 'dialogs/acronym.js');

        editor.widgets.add(pluginName,{
            defaults: {
                acroText: ''
            },
            data: function() {
                var acroText = this.data.acroText;
                this.element.setAttribute('var', acroText);
                this.element.setText('['+acroText+']');
            },
            template: 
                '<span id="var_acronym" style="color:rgb(236, 27, 82)">'+
                '</span>',
            dialog: pluginName,
            init: function() {
                if(editor.getSelection()) {
                    var seletedText = editor.getSelection().getSelectedText();
                    this.setData('acroText', seletedText);
                }
            },
            upcast: function(element, data) {
                var shouldUpcast = false;
                if(element.name === 'span' && element.attributes.id === 'var_acronym') {
                    shouldUpcast = true;
                    data.acroText = element.attributes.var;
                }
                return shouldUpcast;
            }
        });

        editor.ui.addButton('Acronym', {
            label: 'Create Acronym',
            command: pluginName,
            icon: this.path + 'acronym.png'
        });
    }
});
