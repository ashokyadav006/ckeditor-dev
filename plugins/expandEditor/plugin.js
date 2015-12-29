CKEDITOR.plugins.add('acronym', {
    init: function (editor) {
        var pluginName = 'acronym';

        CKEDITOR.dialog.add(pluginName, this.path + 'dialogs/acronym.js');

        /*editor.addCommand(pluginName, {
           exec: function (editor) {
               $("#WitAcronymHiddenDOM").click();
           }
       });*/

        editor.addCommand(pluginName, new CKEDITOR.dialogCommand(pluginName));

        editor.ui.addButton('Acronym', {
            label: 'Acronym',
            command: pluginName,
            icon: this.path + 'acronym.png'
        });
    }
});

