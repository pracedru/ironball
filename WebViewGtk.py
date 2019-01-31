import gi
gi.require_version('Gtk', '3.0')
gi.require_version('WebKit2', '4.0')
from gi.repository import Gtk,WebKit2
window = Gtk.Window()
window.set_default_size(600,800)

def on_destroy(window):
    Gtk.main_quit()
def on_load_failed(web_view, event, uri, error, user_data):
	print(error)
window.connect("destroy",on_destroy)
webview = WebKit2.WebView()
webview.connect("load-failed", on_load_failed)
window.add(webview)

#webview.load_uri("https://www.pracedru.dk:8889/index.html")
webview.load_uri("https://www.w3schools.com/html/html5_canvas.asp")




window.show_all()
Gtk.main()

