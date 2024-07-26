[Setup]
AppName=Quick Launcher
AppVersion=0.0.1
DefaultDirName={pf}\QuickLauncher
DefaultGroupName=QuickLauncher
OutputDir=.
OutputBaseFilename=QuickLauncherInstaller
SetupIconFile=assets\icon.ico
Compression=lzma
SolidCompression=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "chinese"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"
Name: "chinesetraditional"; MessagesFile: "compiler:Languages\ChineseTraditional.isl"
Name: "german"; MessagesFile: "compiler:Languages\German.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "C:\GitHub\QuickStart\python4\dist\QuickLauncher\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "assets\icon.ico"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Quick Launcher"; Filename: "{app}\QuickLauncher.exe"
Name: "{userdesktop}\Quick Launcher"; Filename: "{app}\QuickLauncher.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\QuickLauncher.exe"; Description: "{cm:LaunchProgram,Quick Launcher}"; Flags: nowait postinstall skipifsilent
