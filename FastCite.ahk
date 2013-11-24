; make sure you a) pick a hotkey that suits you (I use Win-C) and an editor you like (in my case, texmaker)
#c::
SendInput, +^C
ClipWait, 2
WinActivate, % "ahk_pid " GetOldestPIDFromProcessName("texmaker.exe")
Sleep 100
SendInput, ^v

GetOldestPIDFromProcessName(strProcessName) {
    for oProc in ComObjGet("winmgmts:").ExecQuery("Select ProcessID,CreationDate from Win32_Process WHERE Name = '" strProcessName "'") {           
        nOldestPID := (nOldestPIDCreationDate > oProc.CreationDate) ? oProc.ProcessID : nOldestPID ? nOldestPID : oProc.ProcessID
        nOldestPIDCreationDate := oProc.CreationDate    
    }
    return nOldestPID
}

