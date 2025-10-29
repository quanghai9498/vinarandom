' Random-FN Silent Launcher
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Chuyen den thu muc project
objShell.CurrentDirectory = "D:\Random-FN"

' Kiem tra file server.js ton tai
If objFSO.FileExists("D:\Random-FN\server.js") Then
    ' Chay ngam voi WindowStyle = 0 (hidden)
    objShell.Run "node server.js", 0, False
    
    ' Tuy chon: Hien thi thong bao
    ' objShell.Popup "Random-FN Server started at http://localhost:3000", 3, "Server Started", 64
Else
    ' Hien thi loi neu khong tim thay file
    objShell.Popup "Error: server.js not found in D:\Random-FN", 0, "Error", 16
End If

Set objShell = CreateObject("WScript.Shell")
objShell.CurrentDirectory = "D:\Random-FN"

' Chay server ngam
objShell.Run "node server.js", 0, False

' Cho 3 giay de server khoi dong
WScript.Sleep 3000

' Mo trinh duyet
objShell.Run "http://localhost:3000"
