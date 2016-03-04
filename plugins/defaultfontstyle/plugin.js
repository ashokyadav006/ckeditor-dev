CKEDITOR.plugins.add('defaultfontstyle', {
    init: function(editor) {
        editor.addCommand('defaultfontstyle', {
            exec: function(editor) {
                var defaultFontStyle = editor.config.defaultFontStyle;
                if (defaultFontStyle) {
                    var fontSize, fontFamily, item;
                    //Find the font size and font family plugin defination from the toolbar 
                    //and call onClick method manually to apply styles. I know its a pain
                    //to do this but i was not able to find any right way to do this so this
                    //hack will work for now.
                    for (var i = 0; i < editor.toolbar.length; i++) {
                        if(editor.toolbar[i].name === 'styles') {
                            for (var j = 0; j < editor.toolbar[i].items.length; j++) {
                                item = editor.toolbar[i].items[j];
                                if(item.name === 'font') {
                                    fontFamily = item;
                                } else if(item.name === 'fontsize') {
                                    fontSize = item;
                                }
                            }
                        }
                    }

                    fontSize.onClick(defaultFontStyle.fontSize);
                    fontFamily.onClick(defaultFontStyle.fontFamily);
                }
            }
        });

        editor.ui.addButton('DefaultFontStyle', {
            label: 'Apply Default Font Style',
            command: 'defaultfontstyle',
            icon: this.path + 'defaultfontstyle.png'
        });
    }
});