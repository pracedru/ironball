#!/usr/bin/python3

import sys

from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtCore import QEvent, Qt, QUrl, QMargins
from PyQt5.QtWidgets import *

app = QApplication(sys.argv)

class WebView(QWebEngineView):
	def __init__(self, parent):
		QWebEngineView.__init__(self, parent)
		self.load(QUrl("https://www.pracedru.dk:8888"))


class MainWindow(QWidget):
	def __init__(self):
		QWidget.__init__(self, None)
		self.setMinimumHeight(720)
		self.setMinimumWidth(360)
		self.setMaximumHeight(720)
		self.setMaximumWidth(360)
		web_view = WebView(self)
		layout = QVBoxLayout()
		self.setLayout(layout)
		layout.setContentsMargins(QMargins(0, 0, 0, 0))
		layout.addWidget(web_view)
		self.installEventFilter(self)

	def eventFilter(self, obj, event):
		if event.type() == QEvent.KeyRelease:
			if event.key() == Qt.Key_Escape:
				print("closing")
				self.close()
				return True
		return False


mw = MainWindow()

mw.showFullScreen()				# fullscreen On phone
#mw.show()								# windowed On desktop

app.exec_()
