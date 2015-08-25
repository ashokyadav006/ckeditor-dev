CKEDITOR.plugins.add('wittyupload', {
    init: function (editor) {
        var pluginName = 'wittyupload';
        editor.addCommand(pluginName, {
           exec: function (editor) {
               document.getElementById("insertImagePlugin").click();
               console.log("Call insert image function !");
           }
        });
        editor.ui.addButton('Wittyupload', {
            label: 'Wittyupload',
            command: pluginName,
            icon: this.path + 'image.png'
        });
    }
});
