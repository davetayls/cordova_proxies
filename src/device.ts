/// <reference path="../typings/tsd.d.ts" />

export function isIOS():boolean {
  return (/ios/i).test(device.platform)
}

export function isAndroid():boolean {
  return (/android/i).test(device.platform)
}

export function isAmazonFireOS():boolean {
  return (/amazon-fireos/i).test(device.platform)
}

export function isAndroidBased():boolean {
  return isAndroid() || isAmazonFireOS();
}
