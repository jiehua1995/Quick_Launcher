import sys
import os
import subprocess
import platform
import json
from PyQt5.QtWidgets import QApplication, QWidget, QVBoxLayout, QHBoxLayout, QPushButton, QLabel, QGridLayout, QSpacerItem, QSizePolicy, QFileDialog
from PyQt5.QtGui import QIcon, QPixmap
from PyQt5.QtCore import Qt, QUrl
from PyQt5.QtGui import QDesktopServices
import requests
from io import BytesIO
import hashlib

class QuickLauncher(QWidget):
    def __init__(self):
        super().__init__()
        self.icon_cache_dir = os.path.join(os.path.expanduser("~"), '.quick_launcher_icons')
        os.makedirs(self.icon_cache_dir, exist_ok=True)
        self.initUI()

    def initUI(self):
        self.setWindowTitle('Quick Launcher')
        icon_path = self.resource_path('assets/icon.ico')
        self.setWindowIcon(QIcon(icon_path))

        layout = QVBoxLayout()

        title = QLabel("Quick Launcher")
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("font-size: 24px; font-weight: bold; margin-bottom: 20px;")
        layout.addWidget(title)

        self.grid_layout = QGridLayout()
        self.grid_layout.setSpacing(10)

        user_data_path = os.path.expanduser("~")
        custom_json_path = os.path.join(user_data_path, 'quick.json')
        default_json_path = self.resource_path('quick.json')

        if os.path.exists(custom_json_path):
            json_path = custom_json_path
        else:
            json_path = default_json_path

        try:
            with open(json_path, 'r') as f:
                self.apps = json.load(f)['items']
        except Exception as e:
            self.apps = []

        row = 0
        col = 0
        max_cols = 4

        for app in self.apps:
            btn = QPushButton(self)
            btn.setFixedSize(150, 100)
            btn_layout = QVBoxLayout(btn)
            icon = self.get_icon(app.get('icon', ''))
            if icon:
                icon_label = QLabel()
                icon_label.setPixmap(icon.pixmap(64, 64))
                icon_label.setAlignment(Qt.AlignCenter)
                btn_layout.addWidget(icon_label)

            text_label = QLabel(app.get('name', 'Unknown'))
            text_label.setAlignment(Qt.AlignCenter)
            btn_layout.addWidget(text_label)

            btn.clicked.connect(lambda checked, a=app: self.launch_item(a))

            self.grid_layout.addWidget(btn, row, col)

            col += 1
            if col >= max_cols:
                col = 0
                row += 1

        layout.addLayout(self.grid_layout)
        layout.addItem(QSpacerItem(20, 40, QSizePolicy.Minimum, QSizePolicy.Expanding))

        user_data_layout = QHBoxLayout()
        user_data_label = QLabel("User Data Path: ")
        user_data_label.setStyleSheet("font-size: 14px; margin-top: 20px;")
        user_data_link = QLabel(f'<a href="file:///{user_data_path}">{user_data_path}</a>')
        user_data_link.setOpenExternalLinks(True)
        user_data_link.setStyleSheet("font-size: 14px; color: blue; text-decoration: none; margin-top: 20px;")

        user_data_layout.addWidget(user_data_label)
        user_data_layout.addWidget(user_data_link)
        user_data_layout.setAlignment(Qt.AlignCenter)

        layout.addLayout(user_data_layout)

        copyright_info = QLabel('''
        <div class="mt-4 text-sm text-gray-600" style="text-align: center;">
            <p>&copy; 2024 Quick Launcher. Powered by <a href="mailto:jiehua@example.com" style="color: blue; text-decoration: none;">Jie Hua</a></p>
        </div>''')
        copyright_info.setAlignment(Qt.AlignCenter)
        copyright_info.setTextFormat(Qt.RichText)
        copyright_info.setStyleSheet("font-size: 12px; color: gray; margin-top: 10px;")
        copyright_info.linkActivated.connect(self.open_email_client)
        layout.addWidget(copyright_info)

        self.setLayout(layout)

    def resource_path(self, relative_path):
        """ Get the absolute path to the resource, works for dev and for PyInstaller """
        base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
        if base_path.endswith('_internal'):
            base_path = os.path.dirname(base_path)
        return os.path.join(base_path, relative_path)

    def get_icon(self, url):
        if not url:
            return None

        hash_name = hashlib.md5(url.encode()).hexdigest()
        icon_ext = os.path.splitext(url)[-1]
        icon_path = os.path.join(self.icon_cache_dir, f'{hash_name}{icon_ext}')

        if os.path.exists(icon_path):
            pixmap = QPixmap(icon_path)
            return QIcon(pixmap)
        else:
            try:
                response = requests.get(url)
                response.raise_for_status()
                img_data = BytesIO(response.content)
                pixmap = QPixmap()
                pixmap.loadFromData(img_data.read())
                pixmap.save(icon_path)
                return QIcon(pixmap)
            except Exception as e:
                return None

    def launch_item(self, app):
        if app.get('type') == 'app':
            self.launch_app(app.get('path', ''))
        elif app.get('type') == 'folder':
            self.open_folder(app.get('path', ''))
        elif app.get('type') == 'file':
            self.open_file(app.get('path', ''))

    def launch_app(self, path):
        if os.path.exists(path):
            subprocess.Popen(path, shell=True)
        else:
            self.show_error(f"The application does not exist at path: {path}")

    def open_folder(self, path):
        if os.path.exists(path):
            os.startfile(path)
        else:
            self.show_error(f"The folder does not exist at path: {path}")

    def open_file(self, path):
        if os.path.exists(path):
            os.startfile(path)
        else:
            self.show_error(f"The file does not exist at path: {path}")

    def show_error(self, message):
        error_dialog = QFileDialog(self)
        error_dialog.setWindowTitle("Error")
        error_dialog.setLabelText(QFileDialog.Accept, message)
        error_dialog.exec_()

    def closeEvent(self, event):
        for i in reversed(range(self.grid_layout.count())):
            widget = self.grid_layout.itemAt(i).widget()
            if widget is not None:
                widget.deleteLater()
        event.accept()

    def open_email_client(self, link):
        if link.startswith("mailto:"):
            QDesktopServices.openUrl(QUrl(link))

def main():
    print("Starting application")
    app = QApplication(sys.argv)
    app.setWindowIcon(QIcon('assets/icon.ico'))
    ex = QuickLauncher()
    ex.show()
    sys.exit(app.exec_())

if __name__ == '__main__':
    main()
