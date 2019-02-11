#!/usr/bin/python3

import sys

from PyQt5.QtWebEngineWidgets import QWebEngineView
from PyQt5.QtCore import QEvent, Qt, QUrl, QMargins
from PyQt5.QtWidgets import *

app = QApplication(sys.argv)
debug = True;


class WebView(QWebEngineView):
	def __init__(self, parent):
		QWebEngineView.__init__(self, parent)
		self.address = "https://www.pracedru.dk:8888"
		if debug:
			self.address = "https://www.pracedru.dk:8889"

		self.load(QUrl(self.address))


class MainWindow(QWidget):
	def __init__(self):
		QWidget.__init__(self, None)
		self.setMinimumHeight(720)
		self.setMinimumWidth(360)
		self.setMaximumHeight(720)
		self.setMaximumWidth(360)
		self.web_view = WebView(self)
		
		layout = QVBoxLayout()
		self.setLayout(layout)
		layout.setContentsMargins(QMargins(0, 0, 0, 0))
		layout.addWidget(self.web_view)
		self.installEventFilter(self)

	def eventFilter(self, obj, event):
		if event.type() == QEvent.KeyRelease:
			if event.key() == Qt.Key_Escape:
				print("closing")
				self.close()
				return True
			if event.key() == Qt.Key_F5:
				print("refresh")
				self.web_view.load(QUrl(self.web_view.address))
				return True
		return False


mw = MainWindow()
if (debug):
	mw.show()													# fullscreen On phone
else:
	mw.showFullScreen()								# windowed On desktop

app.exec_()
