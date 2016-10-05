CKEDITOR.plugins.add('wittywebview', {
    requires: 'widget',
    init: function(editor) {
        var pluginName = 'wittywebview';
        var widget;

        editor.widgets.add(pluginName, {
            defaults: {
                url: ''
            },
            data: function() {
                if (this.data.url) {
                    var iframeTemp = '<iframe src="'+this.data.url+'" height="1000px" width="100%"></iframe>';
                    this.element.setHtml(iframeTemp);
                }
            },
            upcast: function(element, data) {
                if (element.name === 'div' && element.hasClass('witty-web-view')) {
                    data.url = element.attributes['witty-web-url'];
                    return true;
                }
            },
            template: '<div class="witty-web-view"></div>',
            edit: function(evt) {
                evt.cancel();
                var widget = this;

                var injector = angular.element(document).injector();
                injector.invoke(['dialogFactory', 'appPopupFactory',
                    function(dialogFactory, appPopupFactory) {

                        dialogFactory.showWebViewFormDialog({
                            locals: {
                                websiteUrl: widget.data.url,
                                onSuccess: function(url) {
                                    widget.data.url = url;
                                    addWebView(url);
                                }
                            }
                        });

                        function addWebView(url) {
                            var template = '<br><div class="witty-web-view" witty-web-url="'+url+'">'+ 
                            '</div><br>';

                            editor.insertHtml(template);
                        }
                    }
                ]);
            }
        });

        editor.ui.addButton(pluginName, {
            label: 'Insert Website url',
            command: pluginName,
            icon: this.path + 'wittywebview.png'
        });
    }
});
