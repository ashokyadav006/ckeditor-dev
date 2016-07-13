CKEDITOR.plugins.add('acronym', {
    requires: 'widget',
    init: function (editor) {
        var pluginName = 'acronym';

        //CKEDITOR.dialog.add(pluginName, this.path + 'dialogs/acronym.js');

        editor.widgets.add(pluginName,{
            defaults: {
                acroText: '',
                defaultText: '',
                isWidget: false
            },
            data: function() {
                var widget = this;
                var acroText = this.data.acroText;
                this.element.setAttribute('var', acroText);
                this.element.setAttribute('data-default', this.data.defaultText);
                this.element.setText('['+acroText+']');

                var injector = angular.element(document).injector();
                //Get the angular injector to invoke dialog factory to open 
                //our custom dialog
                injector.invoke(['editorUtil', function(editorUtil) {
                    editorUtil.addAcronym({name: widget.data.acroText, defaultValue: widget.data.defaultText});
                }]);
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
            focus: function() {
                //This event has no purpose but it's helping in not focusing widget
                //after widget creation, which helps in case we want to create more than
                //one widget
            },
            edit: function(evt) {
                evt.cancel();
                var widget = this;
                var injector = angular.element(document).injector();

                //Get the angular injector to invoke dialog factory to open 
                //our custom dialog
                injector.invoke(['dialogFactory', 'editorUtil', function(dialogFactory, editorUtil) {
                    var acronyms = editorUtil.getAcronyms();

                    if(widget.data.acroText) {
                        var index = _.findIndex(acronyms, {name: widget.data.acroText});
                        if(index === -1) {
                            editorUtil.addAcronym({name: widget.data.acroText, defaultValue: ''});
                            _createVariable();
                        } else {
                            var parent = widget.wrapper.getParent();
                            if(!parent) {
                                _createVariable();
                            } else {
                                openDialog(index);
                            }
                        }
                    } else {
                        openDialog(null);
                    }

                    function openDialog(varIndex) {
                        dialogFactory.showDialog({
                            templateUrl: "app/modules/components/dialog/variables-dialog/variables-dialog.html",
                            controller: "VariablesDialogController",
                            locals: {
                                selectedVariableIndex: varIndex,
                                createVariable: function(acronym) {
                                    widget.setData('acroText', acronym.name);
                                    widget.setData('defaultText', acronym.defaultValue);
                                    _createVariable();
                                }
                            }
                        });
                    }
                }]);
                // } else {
                //     injector.invoke(['editorUtil', function(editorUtil) {
                //         editorUtil.addAcronym({name: widget.data.acroText, defaultValue: ''});
                //     }]);
                //     _createVariable();
                // }

                function _createVariable() {
                    editor.fire('saveSnapshot');

                    // Cache the container, because widget may be destroyed while saving data,
                    // if this process will require some deep transformations.
                    var container = widget.wrapper.getParent(true);
     
                    // Widget will be retrieved from container and inserted into editor.
                    editor.widgets.finalizeCreation( container );
                    widget.data.isWidget = true;

                    editor.fire('saveSnapshot');
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
            label: 'Create Variable',
            command: pluginName,
            icon: this.path + 'acronym.png'
        });
    }
});
