CKEDITOR.plugins.add('witexpiry', {
    init: function (editor) {
        var pluginName = 'witexpiry';
        editor.addCommand(pluginName, {
           exec: function (editor) {
               $("#WitExpiryHiddenDOM").click();
           }
        });
        editor.ui.addButton('Witexpiry', {
            label: 'Witexpiry',
            command: pluginName,
            icon: this.path + 'wit_expiry.png'
        });
    }
});
