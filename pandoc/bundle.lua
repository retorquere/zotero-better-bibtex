-- bundle.lua
local args = { ... }
local main_script = args[1]
local output_file = args[2]

if not main_script or not output_file then
    print("Usage: lua bundle.lua <main_script.lua> <output.lua> [module1 ...]")
    os.exit(1)
end

local function read_file(path)
    local f = io.open(path, "r")
    if not f then return nil end
    local content = f:read("*a")
    f:close()
    return content
end

-- Resolve a module name or file path to its actual location on disk
local function resolve_module(input)
    -- 1. Direct path check (e.g. "utils.lua" or "lunajson/decoder.lua")
    if read_file(input) then
        local mod_name = input:gsub("%.lua$", ""):gsub("[/\\]", ".")
        return input, mod_name
    end

    -- 2. Clean module name (e.g. convert "lunajson/decoder.lua" -> "lunajson.decoder")
    local mod_name = input:gsub("%.lua$", ""):gsub("[/\\]", ".")

    -- 3. Search Lua's system package.path
    local searched_paths = {}
    for template in package.path:gmatch("[^;]+") do
        local file_path = template:gsub("%?", (mod_name:gsub("%.", "/")))
        table.insert(searched_paths, file_path)
        if read_file(file_path) then
            return file_path, mod_name
        end
    end

    error("Could not find module '" .. input .. "' in local directory or package.path:\n  " .. table.concat(searched_paths, "\n  "))
end

local out = assert(io.open(output_file, "w"), "Could not open output file: " .. output_file)

out:write("-- Bundled with custom preloader script\n")
out:write("package = package or {}\n")
out:write("package.preload = package.preload or {}\n\n")

for i = 3, #args do
    local input = args[i]
    local file_path, mod_name = resolve_module(input)
    local code = read_file(file_path)

    out:write(string.format("package.preload['%s'] = function(...)\n", mod_name))
    out:write(code)
    out:write("\nend\n\n")
end

out:write("-- Main Entry Point --\n")
local main_code = read_file(main_script) or error("Could not open main script: " .. main_script)
out:write(main_code)
out:close()

print(string.format("Successfully bundled %d modules into %s", #args - 2, output_file))