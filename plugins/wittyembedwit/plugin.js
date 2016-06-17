CKEDITOR.plugins.add('wittyembedwit', {
    requires: 'widget',
    init: function(editor) {
        var pluginName = 'wittyembedwit';

        editor.widgets.add(pluginName, {
            defaults: {
                embedId: ''
            },
            data: function() {
                addWitPreview({id: this.data.embedId}, true);
            },  
            upcast: function (element, data) {
                if (element.name === 'div' && element.attributes['embed-wit-id']) {
                    data.embedId = element.attributes['embed-wit-id'];
                    return true;
                }
            } 
        });

        editor.addFeature(editor.widgets.registered[pluginName]);

        editor.on('paste', function(event) {
            if(event.data.type === 'text') {
                var droppedObj, wit;
                try {
                    droppedObj = JSON.parse(event.data.dataValue);
                } catch(e) {
                    event.cancel();
                    return;
                }
                
                if (droppedObj.channel === 'witDrag') {
                    wit = droppedObj.data;

                    if(!wit || !wit.id) {
                        event.cancel();
                        return;
                    }

                    event.data.dataValue = '<div embed-wit-id='+wit.id+' class="embed-wit"></div>';
                    addWitPreview(wit, event);
                }               
            }
        });

        
        function addWitPreview(wit, ev) {
            var injector = angular.element(document).injector();
            //Get the angular injector to invoke dialog factory to open 
            //our custom dialog
            injector.invoke(['witService', 'editorUtil', 'appPopupFactory',
                'witContentPreviewService',
                function(witService, editorUtil, appPopupFactory, witContentPreviewService) {
                    //We are loading wit
                    if (ev === true) {
                        var embedWit = editorUtil.embedWitExist(wit.id);
                        if (embedWit) {
                            generateWitPreview(embedWit);
                        }
                    } else {// We are dragging and dropping wit
                        if (editorUtil.embedWitExist(wit.id)) {
                            appPopupFactory.showSimpleToast('Wit Already added');
                            ev.cancel();
                            return false;
                        } else if(wit.witType === 'COMBO') {
                            appPopupFactory.showSimpleToast('Combo wit embed is not supported');
                            ev.cancel();
                            return false;
                        } else if(wit.witType === 'DOC_WIT') {
                            //Wait for the widget to get added into the editor
                            setTimeout(function() {
                                generateWitPreview(wit);
                            }, 100);
                        } else {
                            witService.getWit(wit.id)
                                .then(function(witData) {
                                    //We don't support multiple level of embedding wits as of now
                                    witData.embeddedWit = [];
                                    generateWitPreview(witData);
                                });                            
                        }
                    }
                    

                    function generateWitPreview(witData) {
                        var compiledHTML = witContentPreviewService.generateContentPreview(witData);
                        var $editor = document.getElementsByTagName('witty-editor')[0];

                        var witContainerWidget = $editor.querySelector('[embed-wit-id="'+wit.id+'"]');
                        if (witContainerWidget) {
                            witContainerWidget.appendChild(compiledHTML[0]);
                        }


                        editorUtil.addEmbedWit(wit.id);

                        //Adding one extra line so that cursor moves to new line
                        setTimeout(function() {
                            var range = editor.createRange();
                            range.moveToPosition( range.root, CKEDITOR.POSITION_BEFORE_END );
                            editor.getSelection().selectRanges([ range ]);

                            editor.execCommand('enter');
                        }, 400);
                    }
                    
            }]);
        }
    }
});
