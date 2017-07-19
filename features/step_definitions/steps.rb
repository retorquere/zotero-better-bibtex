When /$I import (\d+) references from (['"])([^\2]+)\2$/ do |n, json|
  imported = execute(
    args: { filename: File.expand_path(File.join(File.dirname(__FILE__), '../../test/fixtures', json)) },
    script: """
      var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(args.filename);
      yield Zotero_File_Interface.importFile(file, false);
      var items = yield Zotero.items.getAll()
      return args.length;
    """
  )
  expect(imported).to eq(Integer(n))
end

Then /^the library should have (\d+) references/ do |n|
  library = execute("""
      var items = yield Zotero.items.getAll()
      return args.length;
    """
  )
  expect(library).to eq(Integer(n))
end
