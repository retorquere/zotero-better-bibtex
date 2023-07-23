export namespace XUL {
  class Element extends HTMLElement {
    public tagName: string
    public hidden: boolean
    public getAttribute(name: string): string
    public setAttribute(name: string, value: string): void
    public classList: ClassList
    public height: number
    public width: number
  }
  
  class Tabbox extends Element {
    boxObject: {
      public height: number
      public width: number
    }
  }

  class Image extends Element {
    public src: string
  }
  
  class Label extends Element {
    public value: string
  }
  
  class Textbox extends XUL.Element {
    public value: string
    public readonly: boolean
  }
  
  class Checkbox extends XUL.Element {
    public checked: boolean
  }
  
  class Menuitem extends XUL.Element {
    public value: string
    public label: string
  }
  
  class ProgressMeter extends XUL.Element {
    public value: string | number
  }
  
  class Menupopup extends XUL.Element {
    public children: Menuitem[]
  }
  
  class Menulist extends XUL.Element {
    public firstChild: Menupopup
    public selectedItem: Menuitem
    public selectedIndex: number
    public value: string
    public getItemAtIndex(index: number): XUL.Menuitem
    public ensureIndexIsVisible(index: number): void
    public appendItem(label: string, value: string, description?: string): XUL.Menuitem
    public removeAllItems(): void
  }

  class Deck extends XUL.Element {
    public selectedIndex: number
  }
}

class ClassList {
  public add(classname: string): void
  public remove(classname: string): void
  public contains(classname: string): boolean
}

