declare const Components: any
declare const AddonManager: any

Components.utils.import('resource://gre/modules/AddonManager.jsm')

interface IAddon {
  isActive: boolean
}

export let AsyncAddonManager = new class { // tslint:disable-line:variable-name
  public async getAddonByID(id): Promise<IAddon> {
    return new Promise((resolve, reject) => {
      AddonManager.getAddonByID(id, resolve)
    }) as Promise<IAddon>
  }
}
