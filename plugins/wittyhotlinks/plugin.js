CKEDITOR.plugins.add('wittyhotlinks', {
    requires: 'widget',
    init: function(editor) {
        var pluginName = 'wittyhotlinks';

        editor.widgets.add(pluginName, {
            defaults: {
                hotlinkName: '',
                hotlink: '',
                hotlinkId: ''
            },
            data: function() {
                this.element.setText(this.data.hotlinkName);
                this.element.setAttribute('href', this.data.hotlink);
                this.element.setAttribute('hotlink-id', this.data.hotlinkId);
            },
            template: '<a class="witty-hot-links">' +
                '</a>',
            init: function() {
                var widget = this;


                widget.on('doubleclick', function(evt) {
                    evt.cancel();
                    var injector = angular.element(document).injector();
                    injector.invoke(['dialogFactory', 'appPopupFactory', 'hotlinksManagementService',
                        function(dialogFactory, appPopupFactory, hotlinksManagementService) {
                            hotlinksManagementService.getHotlinkInfo(widget.data.hotlinkId)
                                .then(function(response) {
                                    dialogFactory.showHotlinkInfoDialog({
                                        locals: {
                                            hotlinksData: response
                                        }
                                    });
                                });
                        }
                    ]);
                }, null, null, 5);
            },
            upcast: function(element, data) {
                var shouldUpcast = false;
                if (element.name === 'a' && element.hasClass('witty-hot-links')) {
                    shouldUpcast = true;
                    var attributes = element.attributes;
                    data.hotlinkName = element.getHtml();
                    data.hotlink = attributes.href;
                    data.hotlinkId = attributes['hotlink-id'];
                }
                return shouldUpcast;
            },
            edit: function(evt) {
                evt.cancel();
                var widget = this;
                var selectedText;
                //Set selected text as hotlink name if there is any
                if(editor.getSelection()) {
                    seletedText = editor.getSelection().getSelectedText();
                    widget.setData('hotlinkName', seletedText);
                }

                var injector = angular.element(document).injector();
                injector.invoke(['dialogFactory', 'appPopupFactory',
                    function(dialogFactory, appPopupFactory) {
                        dialogFactory.showHotlinksListDialog({
                            insertHotlink: function(hotlinkObj) {
                                if(!widget.data.hotlinkName) {
                                    widget.setData('hotlinkName', hotlinkObj.name);
                                }
                                widget.setData('hotlinkId', hotlinkObj.id);
                                widget.setData('hotlink', hotlinkObj.shortenedUrl);
                                referContent(hotlinkObj);
                                appPopupFactory.showSimpleToast('Inserted hotlink "' + hotlinkObj.name + '"');
                            }
                        });

                        function referContent() {
                            editor.fire('saveSnapshot');
                            // Cache the container, because widget may be destroyed while saving data,
                            // if this process will require some deep transformations.
                            var container = widget.wrapper.getParent(true);
                            // Widget will be retrieved from container and inserted into editor.
                            editor.widgets.finalizeCreation(container);
                            // widget.data.isWidget = true;
                            editor.fire('saveSnapshot');
                        }
                    }
                ]);
            }
        });

        editor.ui.addButton('wittyhotlinks', {
            label: 'Insert hotlink',
            command: pluginName,
            icon: this.path + 'wittyhotlinks.png'
        });
    }
});