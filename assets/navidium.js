/* Issue Duplicate on main cart */
function useConsole(...rest) {
  if (nvdControls?.showConsoleMessage) {
    console.log(
      '%c Navidium App:',
      'color: #00a0e9; font-weight: bold;',
      ...rest
    )
  }
}
;(function injectCss() {
  const cssId = 'nvd-styles'
  if (!document.getElementById(cssId)) {
    const head = document.getElementsByTagName('head')[0]
    const link = document.createElement('link')
    link.id = cssId
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href =
      'https://navidium-static-assets.s3.us-east-1.amazonaws.com/navidium-widgets/css/index.css'
    link.media = 'all'
    head.appendChild(link)
  }
})()
;(function storeCurrency() {
  const currency = Shopify.currency
  useConsole('storing currency', currency)
  localStorage.setItem('nvdCurrency', JSON.stringify(currency))
})()
function findClosest(arr, target, adjustment = 'rounding_down') {
  if (!arr || !arr.length) return null
  let toMatch = parseFloat(target)
  let finalOutput = 0.0
  let n = arr.length
  for (let i = 0; i < n; i++) {
    let current = arr[i]
    let next = arr[i + 1]
    if (toMatch >= current && toMatch <= next) {
      if (adjustment === 'rounding_down') finalOutput = current
      if (adjustment === 'rounding_up') finalOutput = next
      break
    } else if (toMatch <= current) {
      finalOutput = current
      break
    }
  }
  return finalOutput
}
async function removeNavidium() {
  fetch('/cart.js')
    .then((res) => res.json())
    .then((cart) => {
      const { items } = cart
      items.forEach(async (item) => {
        if (item.handle.includes('navidium')) {
          useConsole('removing navidium ---->>>')
          const request = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;',
              Accept: 'application/json'
            },
            body: JSON.stringify({
              id: String(item.variant_id),
              quantity: 0
            })
          }
          fetch('/cart/change.js', request)
            .then((res) => res.json())
            .then((dt) => location.reload())
        }
      })
    })
}

const nvdLocationFinder = location.pathname

if (
  nvdLocationFinder === '/account/login' ||
  nvdLocationFinder === '/account/register'
) {
  useConsole('Navidium Exist')
} else {
  removeNavidium()
}

function formatMoney(cents, format = nvdShopCurrency) {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '')
  }
  let value = ''
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/
  const formatString = format || this.money_format

  function defaultOption(opt, def) {
    return typeof opt === 'undefined' ? def : opt
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2)
    thousands = defaultOption(thousands, ',')
    decimal = defaultOption(decimal, '.')

    if (isNaN(number) || number == null) {
      return 0
    }
    number = (number / 100.0).toFixed(precision)
    const parts = number.split('.')
    const dollars = parts[0].replace(
      /(\d)(?=(\d\d\d)+(?!\d))/g,
      `$1${thousands}`
    )
    const cents = parts[1] ? decimal + parts[1] : ''

    return dollars + cents
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2)
      break
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0)
      break
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',')
      break
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',')
      break
    default:
      value = formatWithDelimiters(cents, 2)
      break
  }

  return formatString.replace(placeholderRegex, value)
}

const prefetch = async (callback) => {
  // Save visitor country
  fetch('https://geolocation-db.com/json/')
    .then((res) => res.json())
    .then((data) => {
      localStorage.setItem('nvdVisitorCountry', data?.country_name)
    })
  // TODO: check nvd_config in localStorage
  let nvdConfig = localStorage.getItem('nvdconfig')
    ? JSON.parse(localStorage.getItem('nvdconfig'))
    : null
  // verify with the shop name
  if (nvdConfig) {
    // check expiration
    const today = new Date()
    const expiration = new Date(nvdConfig.expiration)
    if (today > expiration) {
      // expired
      localStorage.removeItem('nvdconfig')
      nvdConfig = null
      prefetch()
    }
    // var tomorrow = new Date();
    // tomorrow.setDate(today.getDate()+3);
    useConsole('Navidium config avaialable in storage')
  } else {
    useConsole('Navidium config not available in storage')
    await fetch(
      `https://app.navidiumapp.com/api/nvd-widget-v-n-1.php?shop_url=${nvdShop}`
    )
      .then((res) => res.json())
      .then((initialData) => {
        useConsole(initialData)
        const today = new Date()
        const shopConfig = {
          success: initialData.success,
          show_on_cart: initialData.nvd_show_cart,
          show_on_checkout: initialData.nvd_show_checkout,
          widget_location: initialData.widget_location,
          auto_insurance: initialData.nvd_auto_insurance,
          nvd_name: initialData.nvd_name,
          nvd_subtitle: initialData.nvd_subtitle,
          widget_icon: initialData.nvd_widget_icon,
          learnMore: initialData?.nvd_learn_more,
          nvd_description: initialData.nvd_description,
          nvd_message: initialData.nvd_message,
          protection_variants: initialData.nvd_variants,
          product_exclusion: initialData.product_exclusion,
          min_protection_price: initialData.min_protection_value,
          max_protection_price: initialData.max_protection_value,
          protection_type: initialData.nvd_protection_type,
          protection_percentage: initialData.nvd_protection_type_value,
          min_protection_variant: initialData.min_variant_id,
          max_protection_variant: initialData.max_variant_id,
          expiration: today.setDate(today.getDate() + 3),
          nvd_widget_style: initialData.nvd_widget_style,
          previewMode: initialData.nvd_preview_mode,
          rounding_value: initialData.rounding_value,
          maxThreshold: initialData.threshold_value,
          nvd_widget_template: initialData.nvd_widget_template,
          exclusion_action: initialData?.exclusion_action,
          nvd_international: initialData.nvd_international,
          nvd_international_fee: initialData.nvd_international_fee,
          nvd_international_fee_active:
            initialData.nvd_international_fee_active,
          nvd_nations: isValidJSON(initialData?.nvd_nations)
            ? JSON.parse(initialData.nvd_nations)
            : []
        }

        localStorage.setItem('nvdconfig', JSON.stringify(shopConfig))
        if (callback) return callback()
      })
      .catch((err) => {
        useConsole(
          '%c navidium error',
          'color: yellow; background-color: red; font-size: 12px',
          err
        )
      })
  }
}

const calculateProtection = async (cartTotal, nvdConfig) => {
  let conversionRate = parseFloat(Shopify.currency.rate)
  let convertedTotal = cartTotal / conversionRate
  let protection_type = nvdConfig.protection_type
  let protection_percentage = nvdConfig.protection_percentage
  let protectionId
  let protectionPrice
  let minPrice = Number(nvdConfig.min_protection_price)
  let maxPrice = Number(nvdConfig.max_protection_price)
  let minId = nvdConfig.min_protection_variant
  let maxId = nvdConfig.max_protection_variant
  let protectionVariants = nvdConfig.protection_variants
  let PriceRounding = nvdConfig.rounding_value
  const nvdInternationalFeeActive = nvdConfig?.nvd_international_fee_active
  const nvdInternationalFee = nvdConfig?.nvd_international_fee
  protection_type = parseInt(protection_type)
  console.log('113 protection_type', protection_type)

  const nvdVisitorCountry = localStorage.getItem('nvdVisitorCountry')
  const nvd_nations = nvdConfig.nvd_nations?.map((country) => country.name)
  console.log(nvd_nations)
  if (!nvd_nations?.includes(nvdVisitorCountry)) {
    if (nvdInternationalFeeActive == 1) {
      protection_percentage = nvdInternationalFee
      useConsole(
        'International fee is activated, International fee percentage is',
        protection_percentage
      )
    }
  }

  // TODO: check protection type
  if (protection_type == 1) {
    // protection is dynamic
    let ourProtectionPrice = (convertedTotal * protection_percentage) / 100
    ourProtectionPrice = ourProtectionPrice.toFixed(2)

    // calculate the protection
    if (ourProtectionPrice < minPrice) {
      console.log('Our protection price is less than minimum')
      protectionPrice = minPrice
      protectionId = minId
      return {
        price: protectionPrice,
        variant_id: protectionId
      }
    } else if (ourProtectionPrice > maxPrice) {
      console.log('Our protection price is greater than maximum')
      protectionPrice = maxPrice
      protectionId = maxId
      return {
        price: protectionPrice,
        variant_id: protectionId
      }
    } else {
      console.log('calculating protection')

      const priceArray = Object.keys(protectionVariants)
      priceArray.sort((a, b) => a - b)
      protectionPrice = findClosest(
        priceArray,
        ourProtectionPrice,
        PriceRounding
      )
      if (protectionPrice == 0) {
        return {
          price: maxPrice,
          variant_id: maxId
        }
      }
      protectionId = protectionVariants[protectionPrice]
      console.log({
        price: protectionPrice,
        variant_id: protectionId
      })
      return {
        price: protectionPrice,
        variant_id: protectionId
      }
    }
  } else {
    // protection is static.so hit the api
    console.log('protection is static')
    let apiURL = await fetch(
      `https://app.navidiumapp.com/api/variant-id-checker-api-march6.php?shop_url=${nvdShop}&price=` +
        convertedTotal
    )
    let data = apiURL.json()
    return data
  }
}

const nvd_init = async () => {
  console.time('nvd_init')
  localStorage.setItem('nvd_running', true)
  const shopConfig = localStorage.getItem('nvdconfig')
    ? JSON.parse(localStorage.getItem('nvdconfig'))
    : null
  if (shopConfig) {
    useConsole('Navidium config avaialable in storage')
  } else {
    useConsole('Navidium config not avaialable in storage. Prefetching now')
    await prefetch(nvd_init)
    return
  }
  const cartProtectionVariant = localStorage.getItem('cart_protection')
    ? localStorage.getItem('cart_protection')
    : null

  const optedOut = JSON.parse(localStorage.getItem('nvd_opted_out'))
  let showWidget = true

  const exclusionAction = shopConfig?.exclusion_action

  if (exclusionAction == '0') {
    const excluded = isValidJSON(shopConfig.product_exclusion)
      ? JSON.parse(shopConfig.product_exclusion)
      : {}
    const cart = await getCartCallback()

    cart?.items?.forEach((item) => {
      excluded?.sku?.forEach((sku) => {
        if (item.sku === sku) {
          showWidget = false
        }
      })
      excluded?.types?.forEach((type) => {
        if (item.product_type === type) {
          showWidget = false
        }
      })
    })
  }

  const nvdVisitorCountry = localStorage.getItem('nvdVisitorCountry')
  const nvd_nations = shopConfig.nvd_nations?.map((country) => country.name)
  const nvdInternationalActive = shopConfig.nvd_international
  if (nvdInternationalActive == 0) {
    if (!nvd_nations?.includes(nvdVisitorCountry)) showWidget = false
  }

  if (shopConfig.show_on_cart === '0') showWidget = false

  useConsole('showWidget', showWidget)

  const { success } = shopConfig

  let checked

  let nvdVariant

  useConsole('in cart protection variant', cartProtectionVariant)
  // check if widget should be shown and limit did not exceeded
  if (showWidget && success) {
    const cart = await getCartCallback(checkCart)
    const cartTotal = (await cart.total) / 100
    useConsole('after exclusion total price is', cartTotal)
    const getProtection = await calculateProtection(cartTotal, shopConfig)
    console.log({ getProtection })
    const variantFromApi = await getProtection.variant_id
    const priceFromApi = await getProtection.price
    const auto_insurance = shopConfig.auto_insurance
    // Max threshold
    let maxThresholdPrice = parseFloat(shopConfig.maxThreshold)
    maxThresholdPrice = (
      maxThresholdPrice * parseFloat(Shopify.currency.rate)
    ).toFixed(2)
    //console.log('%cNVD Max threshold','background:red;color:#fff;padding:0 3px;',maxThresholdPrice);
    // End of max threshold
    const cartEmpty = cartTotal === 0
    const widgetPlaceHolders = document.querySelectorAll('.nvd-mini')
    const haveWidgetPlaceHolders = widgetPlaceHolders.length > 0
    // now we get the cart total price and time to hit the second api
    localStorage.setItem('nvdProtectionPrice', priceFromApi)
    localStorage.setItem('nvdVariant', variantFromApi)
    if (cartEmpty) {
      document
        .querySelectorAll('.nvd-mini')
        .forEach((item) => (item.innerHTML = ''))
    }
    if (cartEmpty || maxThresholdPrice <= cartTotal) {
      nvdCursorEvent('enabled')
      console.log(
        'cart total is zero or max threshold true. No need to add protection'
      )
      return
    }
    //Do not touch this logic
    var auto_insurance_checker = parseInt(shopConfig.auto_insurance)
    if (auto_insurance_checker != 1) {
      checked = false
    }

    if (optedOut == true || optedOut == null) {
      checked = false
    } else {
      checked = true
    }

    if (auto_insurance_checker == 1 && optedOut == null) {
      checked = true
    }

    if (auto_insurance_checker == 1 && optedOut == false) {
      checked = true
    }
    const widgetTemplate = shopConfig.nvd_widget_template

    useConsole('widget check status: ', checked)
    nvdVariant = variantFromApi
    // build widget theme
    let widgetContent
    if (widgetTemplate === 'widget-1') {
      widgetContent = buildCustomizeWidgetThemeYellow(
        shopConfig,
        priceFromApi,
        nvdVariant,
        checked ? 'checked' : ''
      )
    } else if (widgetTemplate === 'widget-2') {
      widgetContent = buildCustomizeWidgetThemeBlack(
        shopConfig,
        priceFromApi,
        nvdVariant,
        checked ? 'checked' : ''
      )
    } else if (widgetTemplate === 'widget-3') {
      widgetContent = buildCustomizeWidgetThemeBlue(
        shopConfig,
        priceFromApi,
        nvdVariant,
        checked ? 'checked' : ''
      )
    } else if (widgetTemplate === 'widget-4') {
      widgetContent = buildCustomizeWidgetMini(
        shopConfig,
        priceFromApi,
        nvdVariant,
        checked ? 'checked' : ''
      )
    } else if (widgetTemplate === 'widget-5') {
      widgetContent = buildCustomizeWidgetLarge(
        shopConfig,
        priceFromApi,
        nvdVariant,
        checked ? 'checked' : ''
      )
    } else {
      widgetContent = buildOldWidget(
        shopConfig,
        priceFromApi,
        nvdVariant,
        checked ? 'checked' : ''
      )
    }
    // now check the variant in cart is equal to the variant in api return
    if (cartProtectionVariant) {
      if (cartProtectionVariant === variantFromApi) {
        useConsole(
          '1. cart variant is same as the api variant,stay idle and build widget',
          cartProtectionVariant,
          variantFromApi
        )
        nvdVariant = cartProtectionVariant
        if (document.querySelector('.nvd-mini')) {
          document.querySelectorAll('.nvd-mini').forEach((item) => {
            item.innerHTML = widgetContent
          })
        }
        checkWidgetView()
      } else {
        useConsole('cart variant and api variant is not same.swapping them now')
        nvdVariant = variantFromApi
        // now remove the previous navidium variant from cart
        if (cartProtectionVariant) {
          // now add the new protection to the cart
          if (checked) useConsole('removing old and adding new protection')
        }

        // now append the snippet
        if (document.querySelector('.nvd-mini')) {
          document.querySelectorAll('.nvd-mini').forEach((item) => {
            item.innerHTML = widgetContent
          })
        }
        checkWidgetView()
      }
    } else if (checked) {
      useConsole(
        'Protection Not available. Adding now.',
        cartProtectionVariant,
        variantFromApi
      )
      nvdVariant = variantFromApi
      localStorage.setItem('nvd_opted_out', false)
      if (document.querySelector('.nvd-mini')) {
        document.querySelectorAll('.nvd-mini').forEach((item) => {
          item.innerHTML = widgetContent
        })
      }
      checkWidgetView()
    } else {
      nvdVariant = variantFromApi
      useConsole('no protection available, just append snippet')
      if (document.querySelector('.nvd-mini')) {
        document.querySelectorAll('.nvd-mini').forEach((item) => {
          item.innerHTML = widgetContent
        })
      }
      checkWidgetView()
    }

    // now
  } else {
    // when navidium widget is shut off
    useConsole(
      '%c Navidium Message:widget is shut off or limit reached.Please turn on from your app settings or check you have not exceeded your limit',
      'color: yellow; background-color: blue; font-size: 12px'
    )
  }
  console.timeEnd('nvd_init')
  localStorage.setItem('nvd_running', false)
  updateLiveCart()
  setTimeout(nvdCursorEvent('enabled'), 1500)
}

// function to get cart data and pass the data to another callback for processing.
const getCartCallback = async (callback) => {
  const cart = await fetch('/cart.js')
  const cartData = await cart.json()

  if (callback) return callback(cartData)

  return cartData
}
const isValidJSON = (data) => {
  try {
    JSON.parse(data)
    return true
  } catch (error) {
    return false
  }
}

// function to check cart items
const checkCart = async (cartData, callback = null) => {
  const currency = await cartData.currency
  useConsole('cart in check cart', cartData)
  if (cartData.items.length != 0) {
    const { items } = cartData
    let total = parseFloat(cartData.total_price)
    const nvdCounterArray = []
    let recheck = false
    let dupeVariant
    const shopConfig = localStorage.getItem('nvdconfig')
      ? JSON.parse(localStorage.getItem('nvdconfig'))
      : null

    const excluded = isValidJSON(shopConfig.product_exclusion)
      ? JSON.parse(shopConfig.product_exclusion)
      : shopConfig?.product_exclusion?.split(',')

    // if no shop config is found wait and call prefetch
    if (!shopConfig) {
      await prefetch()
    }

    useConsole('product exclusion', excluded)
    const promises = await items.forEach((item) => {
      // check for duplicate navidium
      if (item.handle.includes('navidium-shipping-protection')) {
        nvdCounterArray.push(item.variant_id)

        useConsole('protection available in cart')

        localStorage.setItem('cart_protection', item.variant_id)

        total -= item.final_line_price

        useConsole('nvd1', total)
        if (item.quantity > 1) {
          useConsole('Found duplicate protection in cart,decreasing now')

          // as cart total is update. we need to call the checkCart function recursively
          recheck = true
          dupeVariant = item.variant_id
        } else {
          useConsole('protection duplication test passed')
        }
      } else {
        if (excluded?.length >= 0) {
          excluded?.forEach((sku) => {
            if (item.sku === sku) {
              if (shopConfig.exclusion_action == '0') {
                localStorage.setItem('exclusion_action', 'hide_widget')
              } else {
                useConsole(
                  '%c Navidium Message:Product is excluded',
                  'color: yellow; background-color: blue; font-size: 16px',
                  item.sku,
                  item.final_price
                )
                // substract the item price from total
                total -= item.final_line_price
                useConsole('ex1', total)
              }
            }
          })
        } else {
          excluded?.sku?.forEach((sku) => {
            if (item.sku === sku) {
              useConsole(
                '%c Navidium Message:Product is excluded',
                'color: yellow; background-color: blue; font-size: 16px',
                item.sku,
                item.final_price
              )
              // substract the item price from total
              total -= item.final_line_price
              useConsole('ex1', total)
            }
          })
          excluded?.types?.forEach((type) => {
            if (item.product_type === type) {
              useConsole(
                '%c Navidium Message:Product is excluded',
                'color: yellow; background-color: blue; font-size: 16px',
                item.sku,
                item.final_price
              )
              // substract the item price from total
              total -= item.final_line_price
              useConsole('ex1', total)
            }
          })
        }
      }
    })
    if (recheck === true) {
      const mutateCart = adjustProtectionQuantity(dupeVariant, 0, false)
      useConsole('calling checkCart function recursively', mutateCart)
      getCartCallback(checkCart)
    }
    if (nvdCounterArray.length > 1) {
      useConsole(
        '%cfound more than one variant of navidium protection in cart,removing all now',
        'color:red'
      )
      nvdCounterArray.forEach((item) => {
        useConsole('removing variant', item)
        adjustProtectionQuantity(item, 0)
        localStorage.removeItem('cart_protection')
        recheck = false
      })
    }
    if (nvdCounterArray.length == 0) {
      useConsole('No protection available in cart')
      localStorage.removeItem('cart_protection')
    }
    if (nvdCounterArray.length == items.length) {
      useConsole('no items in cart rather than protection')
      fetch('/cart/clear.js').then((res) => {
        useConsole('cart cleared')
        window.location.reload()
        localStorage.removeItem('cart_protection')
      })
    }
    return {
      total: parseFloat(total),
      currency
    }
  }
  return {
    total: 0,
    currency
  }
}
const guard=async()=>{let t=sessionStorage.getItem("guardStart");if(null==t)return sessionStorage.setItem("guardStart",Date.now()),!0;if(null!=t){let t=sessionStorage.getItem("guardStart");return t=Number(t),t+=5e3,!(Date.now()<t)&&(sessionStorage.setItem("guardStart",Date.now()),!0)}};
// function to add protection to cart
const addProtection = async (variantId, quantity = 1, reload = false) => {
const rs = await guard();
if (rs == false) {
    return
}
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      id: variantId,
      quantity
    })
  }

  const cartData = await fetch('/cart/add.js', request)
  const cartJson = await cartData.json()
  if (cartJson.id) {
    localStorage.setItem('nvd_opted_out', false)
    localStorage.setItem('cart_protection', variantId)
    useConsole(
      '%c Protection added successfully',
      'color: white; background-color: green'
    )
    localStorage.removeItem('nvdconfig')
    const isRedirect = nvdControls?.redirectCheckout?.upsaleOff ?? true
    if (isRedirect) {
      location.href = '/checkout'
    }
  }
}

// function to update protection variant from cart
const adjustProtectionQuantity = async (
  variantId,
  quantity,
  reload = false
) => {
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      id: String(variantId),
      quantity: String(quantity)
    })
  }

  const cartData = await fetch('/cart/change.js', request)

  const cartJson = await cartData.json()

  useConsole(
    '%cnew cart instance after duplicate protection quantity decrease',
    'color:yellow',
    cartJson
  )
  console.dir(cartJson)
  updateLiveCart(cartJson)
  if (reload) {
    location.reload()
  } else {
    return cartJson
  }
}

// widget switch on/off listener function
const getShippingProtection = async (variantId, price, e) => {
  nvdCursorEvent('disabled')
  const { checked } = e

  if (!checked) {
    useConsole('unchecking and removing protection')
    localStorage.setItem('nvd_opted_out', true)
    nvd_init()
    updateLiveCart()
  } else {
    useConsole('checked and adding protection')
    localStorage.setItem('nvd_opted_out', false)
    nvd_init()
    updateLiveCart()
  }
}

// function to update subtotal and dom cart item's line id
const updateLiveCart = async (cartData = null) => {
  let cart = cartData
  if (cart == null) cart = await getCartCallback()
  let curRate = Shopify.currency.rate

  let cartTotal = cart.total_price
  const protectionPrice = Number(localStorage.getItem('nvdProtectionPrice'))
  useConsole('protection price-->>', protectionPrice)
  let totalPrice
  const cartItems = cart.items
  const totalCount = cart.item_count
  const optedOut = localStorage.getItem('nvd_opted_out')
    ? Boolean(JSON.parse(localStorage.getItem('nvd_opted_out')))
    : null

  // change the cart item class name here.
  const lineAttribute = 'data-line'
  const quantityPlus = '[data-action="increase-quantity"]'
  const quantityMinus = '[data-action="decrease-quantity"]'
  const removeItem = '.line-item__quantity-remove'
  const totalElem = document.querySelectorAll(nvdControls?.subtotal_item)
  const cartItemNodes = document.querySelectorAll('.item__cart')
  const cartItemsList = Array.from(cartItemNodes)
  let currentCount
  let XtotalPrice
  //  if not opted out show one less in count
  if (optedOut == false) {
    currentCount = totalCount
    XtotalPrice = cartTotal + protectionPrice * parseFloat(curRate) * 100
    totalPrice = formatMoney(XtotalPrice, nvdShopCurrency)
    useConsole('x total price', XtotalPrice)
  }
  if (optedOut == true || optedOut == null) {
    totalPrice = formatMoney(cart.total_price, nvdShopCurrency)
    currentCount = totalCount
    useConsole(' total price', totalPrice)
  }
  useConsole('updating subtotal', totalPrice)
  if (cart.item_count == 0) currentCount = 0
  useConsole('current and cart count', currentCount, totalCount)
  if (totalElem && document.querySelector('.nvd-mini')?.innerHTML)
    totalElem.forEach((elem) => (elem.innerHTML = totalPrice))

  await updateCartLine(
    lineAttribute,
    cartItemsList,
    cartItems,
    quantityPlus,
    quantityMinus,
    removeItem
  )
}

// function to update the line index in dom cart line items
let updateCartLine = async (
  lineAttribute,
  cartItemsList,
  cartItems,
  qtyPlus,
  qtyMinus,
  rmvItem
) => {
  useConsole(cartItemsList, lineAttribute)
  // for every line item in cart dom check with the cart items.
  await cartItemsList.forEach((item) => {
    useConsole(
      item.innerHTML
        .toString()
        .includes('/products/navidium-shipping-protection')
    )
    if (
      item.innerHTML
        .toString()
        .includes('/products/navidium-shipping-protection') == true
    ) {
      item.style.display = 'none !important'
      item.remove()
    }
    cartItems.forEach((cartItem, index) => {
      if (item.innerHTML.toString().includes(cartItem.url)) {
        useConsole(item.querySelector(`[${lineAttribute}]`))
        const lineItem = item.querySelectorAll(`[${lineAttribute}]`)
        const removeItem = item.querySelectorAll(rmvItem)
        const quantityPlus = item.querySelectorAll(qtyPlus)
        const quantityMinus = item.querySelectorAll(qtyMinus)
        if (lineItem) {
          lineItem.forEach((item) =>
            item.setAttribute(lineAttribute, index + 1)
          )
        }
        if (quantityPlus) {
          quantityPlus.forEach((item) =>
            item.setAttribute(
              'data-href',
              `/cart/change?quantity=${cartItem.quantity + 1}&line=${index + 1}`
            )
          )
        }
        if (quantityMinus) {
          quantityMinus.forEach((item) =>
            item.setAttribute(
              'data-href',
              `/cart/change?quantity=${cartItem.quantity - 1}&line=${index + 1}`
            )
          )
        }
        if (removeItem) {
          removeItem.forEach((item) =>
            item.setAttribute(
              'href',
              `/cart/change?line=${index + 1}&quantity=0`
            )
          )
        }
        useConsole('line id updated')
      }
    })
  })
}
// opt in message toggle function
const checkWidgetView = () => {
  const optedOut = localStorage.getItem('nvd_opted_out')
  const selected = document.querySelector('.nvd-selected')
  const deselected = document.querySelector('.nvd-dis-selected')
  if (optedOut == 'true') {
    if (selected) selected.style.display = 'none'
    if (deselected) deselected.style.display = 'block'
  } else {
    if (selected) selected.style.display = 'block'
    if (deselected) deselected.style.display = 'none'
  }
}

// function that will track the widget real time

const trackWidget = () => {
  const nvd_running = localStorage.getItem('nvd_running')

  const startTracking = setInterval(() => {
    const nvdContainer = document.querySelector('.nvd-mini')
    let hasWidget
    if (nvdContainer) hasWidget = nvdContainer.innerHTML.length

    if (hasWidget < 1) {
      if (nvd_running == 'false') {
        useConsole('widget not available, initiating widget')
        setTimeout(nvd_init, 0)
      }
    }
  }, 3000)
}
if (nvdControls?.trackWidget) trackWidget()
const isValidUrl = (urlString) => {
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // validate protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ) // validate fragment locator
  return !!urlPattern.test(urlString)
}

// function to build the widget
const buildOldWidget = (shopConfig, priceFromApi, nvdVariant, checked) => {
  const {
    nvd_name,
    nvd_subtitle,
    nvd_description,
    widget_icon,
    nvd_message,
    learnMore,
    nvd_widget_style
  } = shopConfig
  const styles = isValidJSON(nvd_widget_style)
    ? JSON.parse(nvd_widget_style)
    : {}
  const {
    amountColor,
    cornerRadius,
    optMessageColor,
    sloganColor,
    titleColor,
    topBgColor,
    learnMoreColor,
    switchColor,
    switchColorOptOut
  } = styles
  const protectionPrice = priceFromApi
  const protectionVariant = nvdVariant
  const protectionCheckbox = checked ? 'checked' : ''
  const selectedStyle = protectionCheckbox
    ? "'display: block'"
    : "'display: none'"
  const diselectedStyle = protectionCheckbox
    ? "'display: none'"
    : "'display: block'"

  let learnMoreMarkup = isValidUrl(learnMore)
    ? ` 
      <a href=${learnMore} title="Learn more" target='_blank' class='tab-icon mini'>
            <svg fill=${learnMoreColor} width='10'  id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 428.28 428.29"><path d="M214.15,428.26c-49.16,0-98.33.1-147.49-.05-22.42-.07-40.72-8.95-54.21-27.06A62.29,62.29,0,0,1,.13,363.27q-.19-149,0-298C.2,28.79,28.86.26,65.39.12c63-.22,126-.07,189,0,9.74,0,17.75,3.47,22.05,12.67,3.76,8,2.93,16-2.62,23-5,6.4-12.05,8.49-19.93,8.49q-52.26,0-104.5,0-41.25,0-82.5,0c-14.71,0-22.61,7.83-22.61,22.43q0,147.5,0,295C44.27,376.22,52.22,384,67,384q147.24,0,294.48,0c14.69,0,22.57-7.85,22.58-22.48q.06-93,0-186c0-5.77.65-11.32,4-16.22,5.4-7.84,13.07-10.83,22.18-9.22s14.78,7.33,17.08,16.23a31.85,31.85,0,0,1,.9,7.91q.07,93.75,0,187.49c-.06,32.68-21.24,58.69-52.67,65.1a76.3,76.3,0,0,1-15.4,1.42Q287.15,428.22,214.15,428.26Z"/><path d="M352.54,44.74c-5.35-1-9.85-.17-14.25-1.11-10.53-2.26-18.18-11.18-18.13-21.54A22,22,0,0,1,338.43.75a41.07,41.07,0,0,1,7.43-.67q28.25-.08,56.48,0c17.06,0,25.87,8.85,25.9,25.94,0,19.32.08,38.65,0,58-.06,11.58-6,20.13-15.67,23-14.28,4.32-27.66-5.77-28.45-21.5-.15-2.93,0-5.87,0-9-2.85.59-3.85,2.47-5.19,3.82Q305.2,154,231.59,227.76c-5.6,5.62-11.86,9.33-20,8.19-9-1.26-15.33-6.25-18.28-15s-.56-16.4,5.87-22.82q47.52-47.55,95.1-95,26.87-26.85,53.73-53.7C349.35,48.12,350.58,46.79,352.54,44.74Z"/></svg>
      </a>
`
    : ''

  const snippet = ` <div class="appearance-right-previw-ld" id="nvd-widget-cart" style="background-color:${topBgColor}; border-radius:${cornerRadius};padding: 10px 10px 0px 0px;">
  <div class="d-flexCstm-ld">
    <div class="flex-shrink-0Cstm-ld">
      <div class="form-checkCstm-ld form-switchCstm-ld">
        <input
        style="background-color:${checked ? switchColor : switchColorOptOut};"
          class="forms-check-inputCstm-ld"
          type="checkbox"
          id="shippingProtectionCheckBox"
          onclick="getShippingProtection('${protectionVariant}','${protectionPrice}', this)" ${protectionCheckbox} data-protected-variant="${protectionVariant}"
           />
        <div class="img">
          <img
            class="navidium-shipping-icon-ld"
            width="auto"
            height="auto"
            src=${encodeURI(widget_icon)}
            alt="Navidium icon" />
          <svg
          fill="${checked ? switchColor : switchColorOptOut}"
            width="20"
            height="26"
            viewBox="0 0 20 26"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
            fill="${checked ? switchColor : switchColorOptOut}"
              d="M9.8056 0.867554L0.00976562 4.2023C0.218188 8.16232 -0.177814 14.415 0.635031 17.1245C1.32282 19.4171 7.16558 23.8634 9.8056 25.6698C11.9593 23.9329 17.3442 20.4317 18.3509 18.1666C20.0183 14.415 19.8793 8.09285 19.6014 4.2023L9.8056 0.867554Z"
              fill="#6D7175"></path>
            <path
            fill="${checked ? switchColor : switchColorOptOut}"
              d="M5.01172 13.1644L7.92963 16.7076L14.3907 10.0381"
              stroke="white"
              stroke-width="1.66738"
              stroke-linecap="round"
              stroke-linejoin="round"></path>
          </svg>
        </div>
      </div>
    </div>
    <div class="flex-grow-1Cstm-ld ms-3Cstm-ld">
      <h4  style="color:${titleColor}; display:flex; gap:10px;">${nvd_name}
      ${learnMoreMarkup}
      </h4>
      <p style="color:${sloganColor};">
      <span>${nvd_subtitle}</span>
        <strong style="color:${amountColor};" class="shipping-protection-price-ld">   ${formatMoney(
    protectionPrice * 100 * parseFloat(Shopify.currency.rate),
    nvdShopCurrency
  )}</strong>
      </p>
      <div style="color:${optMessageColor};">
      <p class="nvd-selected-ld" style=${selectedStyle};}>${nvd_description}</p>
      <p class="nvd-dis-selected-ld" style=${diselectedStyle}>${nvd_message}</p>
      </div>
    
    </div>
  </div>
</div>`
  return snippet
}
const buildCustomizeWidgetThemeYellow = (
  shopConfig,
  priceFromApi,
  nvdVariant,
  checked
) => {
  const {
    nvd_name,
    nvd_subtitle,
    nvd_description,
    widget_icon,
    nvd_message,
    learnMore,
    nvd_widget_style
  } = shopConfig
  const styles = isValidJSON(nvd_widget_style)
    ? JSON.parse(nvd_widget_style)
    : {}
  const {
    amountColor,
    bottomBgColor,
    cornerRadius,
    logoBg,
    optMessageColor,
    sloganColor,
    titleColor,
    topBgColor,
    learnMoreColor,
    switchColor,
    switchColorOptOut
  } = styles
  const protectionPrice = priceFromApi
  const protectionVariant = nvdVariant
  const protectionCheckbox = checked ? 'checked' : ''
  const selectedStyle = protectionCheckbox
    ? "'display: block'"
    : "'display: none'"
  const diselectedStyle = protectionCheckbox
    ? "'display: none'"
    : "'display: block'"
  let nvdUrl = learnMore
  if (!/^https?:\/\//i.test(nvdUrl)) {
    nvdUrl = 'https://' + nvdUrl
  }
  let learnMoreMarkup = ''
  if (learnMore.length !== 0) {
    learnMoreMarkup = `
      <a style="color:${learnMoreColor};" href="${nvdUrl}" target="_blank">Learn more</a>
   `
  }
  const snippet = `
    <div class="appearance-right-previw">
        <div class="d-flexCstm" style="background:${topBgColor}; border-top-left-radius:${cornerRadius}; border-top-right-radius:${cornerRadius};">
          <div class="flex-shrink-0Cstm">
            <div class="form-checkCstm form-switchCstm">
              <input  style="background-color:${
                checked ? switchColor : switchColorOptOut
              };" class="forms-check-inputCstm" type="checkbox" id='shippingProtectionCheckBox'  onclick="getShippingProtection('${protectionVariant}','${protectionPrice}', this)" ${protectionCheckbox} data-protected-variant="${protectionVariant}">
                <div class="img" style="background:${logoBg};">
                  <img class="navidium-shipping-icon" src=${widget_icon} alt="Navidium icon">
                </div>
            </div>
          </div>
          <div class="flex-grow-1Cstm ms-3Cstm">
             <h4 style="color:${titleColor};">${nvd_name}
             </h4>
             <p style="color:${sloganColor};">${nvd_subtitle}</p>
             <div class="nvd-powered-bx">
                <p>Powered by <img src="https://navidiumcheckout.com/cdn/powered.png" alt=""></p>
             </div>
          </div>
          <div class="price-right-nvd">
            <strong 
            style="color:${amountColor};"
                >
                ${formatMoney(
                  protectionPrice * 100 * parseFloat(Shopify.currency.rate),
                  nvdShopCurrency
                )}
                      
                </strong>
          </div>
        </div>
        <div class="block collapse_nvd first show" style="background:${bottomBgColor};border-top-left-radius:${cornerRadius}; border-top-right-radius:${cornerRadius};">
            <div class="block__content_nvd" style="color:${optMessageColor};">
                <p style=${selectedStyle}>${nvd_description}</p>
                <p style=${diselectedStyle}>${nvd_message}</p>
                ${learnMoreMarkup}
            </div>
          </div>
      </div>
  `
  return snippet
}
const buildCustomizeWidgetThemeBlack = (
  shopConfig,
  priceFromApi,
  nvdVariant,
  checked
) => {
  const {
    nvd_name,
    nvd_subtitle,
    nvd_description,
    widget_icon,
    nvd_message,
    learnMore,
    nvd_widget_style
  } = shopConfig
  const styles = isValidJSON(nvd_widget_style)
    ? JSON.parse(nvd_widget_style)
    : {}
  const {
    amountColor,
    cornerRadius,
    logoBg,
    optMessageColor,
    sloganColor,
    titleColor,
    topBgColor,
    bottomBgColor,
    learnMoreColor,
    switchColor
  } = styles
  const protectionPrice = priceFromApi
  const protectionVariant = nvdVariant
  const protectionCheckbox = checked ? 'checked' : ''
  const selectedStyle = protectionCheckbox
    ? "'display: block'"
    : "'display: none'"
  const diselectedStyle = protectionCheckbox
    ? "'display: none'"
    : "'display: block'"

  let learnMoreMarkup = ''
  if (learnMore.length !== 0 && isValidUrl(learnMore)) {
    learnMoreMarkup = `
                       <a style="color:${learnMoreColor}" href="${learnMore}" target="_blank">Learn more</a>
                    `
  }
  const snippet = `
  <div class="appearance-right-previw nvd-wid-style2 nvd-dark">
      <div class="d-flexCstm" style="background:${topBgColor};border-top-left-radius:${cornerRadius}; border-top-right-radius:${cornerRadius};">
        <div class="flex-shrink-0Cstm">
          <div class="form-checkCstm form-switchCstm"> 
            <div class="img" style="background:${logoBg}">
                <img class="navidium-shipping-icon" src=${widget_icon} alt="Navidium icon">
            </div>
          </div>
        </div>
        <div class="flex-grow-1Cstm ms-3Cstm">
            <h4 style="color:${titleColor};">${nvd_name}</h4>
            <p style="color:${sloganColor};">${nvd_subtitle}</p>
        </div>
        <div class="price-right-nvd">
            <span class="nvd-price-protn" style="color:${amountColor};">
                  ${formatMoney(
                    protectionPrice * 100 * parseFloat(Shopify.currency.rate),
                    nvdShopCurrency
                  )}
            </span>
            <p style="color:${switchColor}" class="remove-btn-nvd ${protectionCheckbox}" onclick="addShippingProtection()" ${protectionCheckbox} id='shippingProtectionCheckBox'>${
    protectionCheckbox ? 'Remove' : 'Add'
  }</p>
        </div>
      </div>
      <div class="d-flexCstm powered-nvd" style="background:${bottomBgColor};">
      ${learnMoreMarkup}
        <div class="nvd-powered-bx">
        <p>Powered by <img src="https://navidiumcheckout.com/cdn/powered.png" alt=""></p>
       </div>
      </div>
      <div class="block__content_nvd" style="background:${bottomBgColor};color:${optMessageColor};border-bottom-left-radius:${cornerRadius}; border-bottom-right-radius:${cornerRadius};">
      <p style=${selectedStyle}>${nvd_description}</p>
      <p style=${diselectedStyle}>${nvd_message}</p>
      </div>
  </div>
  `
  return snippet
}
const buildCustomizeWidgetThemeBlue = (
  shopConfig,
  priceFromApi,
  nvdVariant,
  checked
) => {
  const {
    nvd_name,
    nvd_subtitle,
    nvd_description,
    widget_icon,
    nvd_message,
    learnMore,

    nvd_widget_style
  } = shopConfig
  const styles = isValidJSON(nvd_widget_style)
    ? JSON.parse(nvd_widget_style)
    : {}
  const {
    amountColor,
    bottomBgColor,
    cornerRadius,
    logoBg,
    optMessageColor,
    sloganColor,
    titleColor,
    topBgColor,
    switchColor,
    learnMoreColor,
    switchColorOptOut
  } = styles
  const protectionPrice = priceFromApi
  const protectionVariant = nvdVariant
  const protectionCheckbox = checked ? 'checked' : ''
  const selectedStyle = protectionCheckbox
    ? "'display: block'"
    : "'display: none'"
  const diselectedStyle = protectionCheckbox
    ? "'display: none'"
    : "'display: block'"

  let learnMoreMarkup = ''
  if (learnMore.length !== 0 && isValidUrl(learnMore)) {
    learnMoreMarkup = ` 
      <a style="color:${learnMoreColor}" href="${learnMore}" target="_blank">Learn more</a>
   `
  }

  const snippet = `
  <div class="appearance-right-previw nvd-wid-style2 nvd-dark">
  <div class="d-flexCstm" style="background:${topBgColor}; border-top-left-radius:${cornerRadius}; border-top-right-radius:${cornerRadius};">
    <div class="flex-shrink-0Cstm">
      <div class="form-checkCstm form-switchCstm">
        <input id='shippingProtectionCheckBox'  style="background-color:${
          checked ? switchColor : switchColorOptOut
        };" class="forms-check-inputCstm" type="checkbox"  onclick="getShippingProtection('${protectionVariant}','${protectionPrice}', this)" ${protectionCheckbox} data-protected-variant="${protectionVariant}">
        <div class="img" style="background:${logoBg};">
        <img class="navidium-shipping-icon" src=${widget_icon} alt="Navidium icon">
      </div>
      </div>
    </div>
    <div class="flex-grow-1Cstm ms-3Cstm">
    <h4 style="color:${titleColor};">${nvd_name} </h4>
    <p style="color:${sloganColor};">${nvd_subtitle}</p>
    </div>
    <div class="price-right-nvd">
      <span class="nvd-price-protn"   style="color:${amountColor};">
      ${formatMoney(
        protectionPrice * 100 * parseFloat(Shopify.currency.rate),
        nvdShopCurrency
      )}
      </span>
    </div>
  </div>
  <div class="block__content_nvd" style="background:${bottomBgColor};color:${optMessageColor};">
  <p style=${selectedStyle}>${nvd_description}</p>
  <p style=${diselectedStyle}>${nvd_message}</p>
</div>
  <div class="d-flexCstm powered-nvd" style="background:${bottomBgColor};border-bottom-left-radius:${cornerRadius}; border-bottom-right-radius:${cornerRadius};">
  ${learnMoreMarkup}
    <div class="nvd-powered-bx" style="background-color:#fff;">
    <p style="color:#000;">Powered by <img style="filter:none"} src="https://navidiumcheckout.com/cdn/powered.png" alt=""></p>
   </div>
  </div>
      
</div>
    
  `
  return snippet
}
const buildCustomizeWidgetMini = (
  shopConfig,
  priceFromApi,
  nvdVariant,
  checked
) => {
  const { nvd_name, nvd_subtitle, learnMore, widget_icon, nvd_widget_style } =
    shopConfig
  const styles = isValidJSON(nvd_widget_style)
    ? JSON.parse(nvd_widget_style)
    : {}
  const {
    amountColor,
    cornerRadius,
    logoBg,
    sloganColor,
    titleColor,
    topBgColor,
    switchColor,
    learnMoreColor,
    switchColorOptOut
  } = styles
  const protectionPrice = priceFromApi
  const protectionVariant = nvdVariant
  const protectionCheckbox = checked ? 'checked' : ''

  let learnMoreMarkup = isValidUrl(learnMore)
    ? ` 
      <a href=${learnMore} target='_blank' class='tab-icon mini'>
            <svg fill=${learnMoreColor} width='10'  id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 428.28 428.29"><path fill=${learnMoreColor} d="M214.15,428.26c-49.16,0-98.33.1-147.49-.05-22.42-.07-40.72-8.95-54.21-27.06A62.29,62.29,0,0,1,.13,363.27q-.19-149,0-298C.2,28.79,28.86.26,65.39.12c63-.22,126-.07,189,0,9.74,0,17.75,3.47,22.05,12.67,3.76,8,2.93,16-2.62,23-5,6.4-12.05,8.49-19.93,8.49q-52.26,0-104.5,0-41.25,0-82.5,0c-14.71,0-22.61,7.83-22.61,22.43q0,147.5,0,295C44.27,376.22,52.22,384,67,384q147.24,0,294.48,0c14.69,0,22.57-7.85,22.58-22.48q.06-93,0-186c0-5.77.65-11.32,4-16.22,5.4-7.84,13.07-10.83,22.18-9.22s14.78,7.33,17.08,16.23a31.85,31.85,0,0,1,.9,7.91q.07,93.75,0,187.49c-.06,32.68-21.24,58.69-52.67,65.1a76.3,76.3,0,0,1-15.4,1.42Q287.15,428.22,214.15,428.26Z"/><path d="M352.54,44.74c-5.35-1-9.85-.17-14.25-1.11-10.53-2.26-18.18-11.18-18.13-21.54A22,22,0,0,1,338.43.75a41.07,41.07,0,0,1,7.43-.67q28.25-.08,56.48,0c17.06,0,25.87,8.85,25.9,25.94,0,19.32.08,38.65,0,58-.06,11.58-6,20.13-15.67,23-14.28,4.32-27.66-5.77-28.45-21.5-.15-2.93,0-5.87,0-9-2.85.59-3.85,2.47-5.19,3.82Q305.2,154,231.59,227.76c-5.6,5.62-11.86,9.33-20,8.19-9-1.26-15.33-6.25-18.28-15s-.56-16.4,5.87-22.82q47.52-47.55,95.1-95,26.87-26.85,53.73-53.7C349.35,48.12,350.58,46.79,352.54,44.74Z"/></svg>
      </a>
`
    : ''
  const snippet = `
    <div class="appearance-right-previw">
        <div class="d-flexCstm" style="background:${topBgColor}; border-radius:${cornerRadius};">
          <div class="flex-shrink-0Cstm">
            <div class="form-checkCstm form-switchCstm">
              <input  style="background-color:${
                checked ? switchColor : switchColorOptOut
              };" id='shippingProtectionCheckBox' class="forms-check-inputCstm" type="checkbox"  onclick="getShippingProtection('${protectionVariant}','${protectionPrice}', this)" ${protectionCheckbox} data-protected-variant="${protectionVariant}">
                <div class="img" style="background:${logoBg};">
                  <img class="navidium-shipping-icon" src=${widget_icon} alt="Navidium icon">
                </div>
            </div>
          </div>
          <div class="flex-grow-1Cstm ms-3Cstm">
             <h4 style="color:${titleColor};">
             ${nvd_name}
             ${learnMoreMarkup}
             </h4>
             <p style="color:${sloganColor};">${nvd_subtitle}</p>
             <div class="nvd-powered-bx">
                <p>Powered by <img src="https://navidiumcheckout.com/cdn/powered.png" alt=""></p>
             </div>
          </div>
          <div class="price-right-nvd">
            <p 
            style="color:${amountColor};"
                
                >
                ${formatMoney(
                  protectionPrice * 100 * parseFloat(Shopify.currency.rate),
                  nvdShopCurrency
                )}
                      
                </p>
          </div>
        </div>
     
      </div>
  `
  return snippet
}
const buildCustomizeWidgetLarge = (
  shopConfig,
  priceFromApi,
  nvdVariant,
  checked
) => {
  const { nvd_name, nvd_subtitle, learnMore, nvd_widget_style } = shopConfig
  const styles = isValidJSON(nvd_widget_style)
    ? JSON.parse(nvd_widget_style)
    : {}
  const {
    titleColor,
    sloganColor,
    amountColor,
    topBgColor,
    bottomBgColor,
    switchColor,
    learnMoreColor,
    noThanksText,
    noThanksTextColor,
    largeHeading
  } = styles
  const protectionPrice = priceFromApi
  const protectionVariant = nvdVariant
  const protectionCheckbox = checked ? 'checked' : ''
  let learnMoreMarkup = ''
  if (isValidUrl(learnMore)) {
    learnMoreMarkup = ` 
         <a href=${learnMore} target='_blank' class='tab-icon'>
            <svg fill=${learnMoreColor} width='18'  id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 428.28 428.29"><path fill=${learnMoreColor} d="M214.15,428.26c-49.16,0-98.33.1-147.49-.05-22.42-.07-40.72-8.95-54.21-27.06A62.29,62.29,0,0,1,.13,363.27q-.19-149,0-298C.2,28.79,28.86.26,65.39.12c63-.22,126-.07,189,0,9.74,0,17.75,3.47,22.05,12.67,3.76,8,2.93,16-2.62,23-5,6.4-12.05,8.49-19.93,8.49q-52.26,0-104.5,0-41.25,0-82.5,0c-14.71,0-22.61,7.83-22.61,22.43q0,147.5,0,295C44.27,376.22,52.22,384,67,384q147.24,0,294.48,0c14.69,0,22.57-7.85,22.58-22.48q.06-93,0-186c0-5.77.65-11.32,4-16.22,5.4-7.84,13.07-10.83,22.18-9.22s14.78,7.33,17.08,16.23a31.85,31.85,0,0,1,.9,7.91q.07,93.75,0,187.49c-.06,32.68-21.24,58.69-52.67,65.1a76.3,76.3,0,0,1-15.4,1.42Q287.15,428.22,214.15,428.26Z"/><path d="M352.54,44.74c-5.35-1-9.85-.17-14.25-1.11-10.53-2.26-18.18-11.18-18.13-21.54A22,22,0,0,1,338.43.75a41.07,41.07,0,0,1,7.43-.67q28.25-.08,56.48,0c17.06,0,25.87,8.85,25.9,25.94,0,19.32.08,38.65,0,58-.06,11.58-6,20.13-15.67,23-14.28,4.32-27.66-5.77-28.45-21.5-.15-2.93,0-5.87,0-9-2.85.59-3.85,2.47-5.19,3.82Q305.2,154,231.59,227.76c-5.6,5.62-11.86,9.33-20,8.19-9-1.26-15.33-6.25-18.28-15s-.56-16.4,5.87-22.82q47.52-47.55,95.1-95,26.87-26.85,53.73-53.7C349.35,48.12,350.58,46.79,352.54,44.74Z"/></svg>
        </a>
   `
  } else {
    learnMoreMarkup = `
    <div class='tooltipCstmNvd'>
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='20'
      height='20'
      fill=${learnMoreColor}>
      <path
        d='M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.478 10-10S15.522 0 10 0zm2.082 15.498a32.99 32.99 0 0 1-1.232.464c-.306.107-.663.16-1.068.16-.623 0-1.108-.152-1.454-.456a1.47 1.47 0 0 1-.517-1.157 4.2 4.2 0 0 1 .038-.558c.026-.19.068-.403.124-.643l.644-2.275c.057-.218.106-.426.145-.619s.058-.373.058-.536c0-.29-.06-.493-.179-.607s-.349-.17-.688-.17c-.166 0-.337.025-.512.076s-.324.102-.448.149l.17-.701a16.05 16.05 0 0 1 1.211-.441c.385-.124.749-.185 1.092-.185.619 0 1.096.151 1.432.449a1.49 1.49 0 0 1 .503 1.165c0 .099-.012.273-.035.522a3.5 3.5 0 0 1-.129.687l-.641 2.269c-.052.182-.099.39-.141.623s-.062.411-.062.53c0 .301.067.507.202.616s.368.164.7.164a2.03 2.03 0 0 0 .53-.082 3.01 3.01 0 0 0 .428-.144l-.172.7zm-.114-9.209a1.53 1.53 0 0 1-1.079.417c-.42 0-.782-.139-1.084-.417a1.33 1.33 0 0 1-.451-1.01c0-.394.152-.732.451-1.012s.664-.421 1.084-.421.781.14 1.079.421a1.34 1.34 0 0 1 .449 1.012c0 .395-.15.732-.449 1.01z'
        fill=${learnMoreColor}
      />
    </svg>
    <div class='toolltiptextCstmNvd'>${learnMore}</div>
  </div>
    
    
    `
  }

  const snippet = `
 <div class="appearance-right-previw-nvd">
      <div class="protection-title-nvd">
        <h3>
          ${largeHeading}*
         ${learnMoreMarkup}
        </h3>
      </div>
      <div class="d-flexCstmNvd">
        <div class="flex-shrink-0Cstm">
          <div class="purchaseYesNvd">
            <input
            onclick="getShippingProtection('${protectionVariant}','${protectionPrice}', this)" ${protectionCheckbox}
              type="radio"
              name="nvdProtectionBtn"
              id="shippingProtectionCheckBox"
            />
            <div class="innerContentNvdMn" style="background-color:${topBgColor};border-color:${
    checked ? switchColor : ''
  }">
            <h4 style="color:${titleColor};">
            ${nvd_name}
            <small style="color:${amountColor}">+  ${formatMoney(
    protectionPrice * 100 * parseFloat(Shopify.currency.rate),
    nvdShopCurrency
  )}</small>
          </h4>
              <p style="color:${sloganColor}" >${nvd_subtitle}</p>
              <span class="checkMarkDf" style="background-color:${switchColor}; display:${
    !checked ? 'none' : 'flex'
  }">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path
                    d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
                </svg>
              </span>
            </div>
          </div>
        </div>
        <div class="flex-grow-1Cstm">
          <div class="purchaseNopeNvd" >
            <input
            ${protectionCheckbox ? '' : 'checked'}
              type="radio"
              name="nvdProtectionBtn"
               onclick="getShippingProtection('${protectionVariant}','${protectionPrice}', false)"/>
            <div class="innerContentNvdMn" style="background-color:${bottomBgColor}; border-color:${
    !protectionCheckbox ? switchColor : ''
  }">
              <p style="color:${noThanksTextColor}">${noThanksText}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    
  `
  return snippet
}

// For Protection add/remove button
const addShippingProtection = () => {
  const nvdBtn = document.getElementById('shippingProtectionCheckBox')

  const classes = nvdBtn?.classList

  const checked = classes.toggle('checked')

  if (!checked) {
    useConsole('unchecking and removing protection')
    localStorage.setItem('nvd_opted_out', true)
    nvd_init()
    updateLiveCart()
  } else {
    useConsole('checked and adding protection')
    localStorage.setItem('nvd_opted_out', false)
    nvd_init()
    updateLiveCart()
  }
}

function nvdCursorEvent(event) {
  if (event === 'enabled') {
    Array.from(document.querySelectorAll(nvdControls?.cursorControl)).forEach(
      (element) => {
        element.style.pointerEvents = 'auto'
      }
    )
  } else {
    Array.from(document.querySelectorAll(nvdControls?.cursorControl)).forEach(
      (element) => {
        element.style.pointerEvents = 'none'
      }
    )
  }
}

function nvdDebounce(func, wait = 500, immediate) {
  var timeout
  return function () {
    var context = this,
      args = arguments
    var later = function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    var callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}

let isDOMLoaded = false
window.addEventListener('DOMContentLoaded', () => {
  isDOMLoaded = true
  prefetch()
  new Promise(function (resolve, reject) {
    setTimeout(nvd_init, 0)
  }).then(function () {
    updateLiveCart(null)
    console.log('Wrapped setTimeout after 2000ms')
  })
})

window.onload = () => {
  if (document.querySelector('.nvd-mini')?.innerHTML.length === 0) {
    setTimeout(() => {
      nvd_init().then(() => updateLiveCart())
    }, 1000)
  }
}

async function xNvd() {
  const cart = await fetch('/cart.js')
  const data = cart.json()
  data.then((e) => {
    e.items.forEach((e) => {
      if (e.handle == 'shipping-protection') {
        let vId = e.variant_id
        vId = vId.toString()
        console.log('vid = ', vId)
        const result = fetch('/cart/change.json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            id: vId,
            quantity: 0
          })
        })
        result.then((e) => {
          if (e.status == 200) {
            location.reload()
          }
        })
      }
    })
  })
}
window.onload = () => {
  setTimeout(nvd_init, 2000)
  setTimeout(xNvd, 2000)
}
// Main trigger area

window.addEventListener(
  'click',
  (ev) => {
    const navidiumTriggers = Array.from(
      document.querySelectorAll(nvdControls?.clickTriggers)
    )
    const elm = ev.target
    setTimeout(injectNvdToCart, 500)
    if (navidiumTriggers.includes(elm)) {
      nvdCursorEvent('disabled')

      useConsole('navidium triggered slide cart')
      setTimeout(() => {
        nvd_init()
          .then(() => {
            updateLiveCart()
          })
          .catch((err) => {
            nvdCursorEvent('enabled')
          })
      }, 2000)
    }
  },
  nvdControls?.forceClick ?? true
)

//on select option change quantity
window.addEventListener(
  'change',
  (ev) => {
    const navidiumTriggers = Array.from(
      document.querySelectorAll(nvdControls.changeTrigger)
    )
    const elm = ev.target
    if (navidiumTriggers.includes(elm)) {
      nvdCursorEvent('disabled')

      useConsole('navidium triggered slide cart')
      setTimeout(() => {
        nvd_init()
          .then(() => {
            updateLiveCart()
          })
          .catch((err) => {
            nvdCursorEvent('enabled')
          })
      }, 2000)
    }
  },
  true
)

if (
  /Android|webOS|Mac|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
) {
  // Code for mobile devices
  $(document).one(
    `${nvdControls?.iosDeviceListener}`,
    nvdControls.CheckoutBtns,
    function (e) {
      console.log('Mini Device:: Clicked on checkout')
      e.preventDefault()
      let checked = document
        .querySelector('#shippingProtectionCheckBox')
        ?.hasAttribute('checked')

      if (localStorage.getItem('nvdVariant') != null) {
        let variantId = localStorage.getItem('nvdVariant')
        if (!checked) {
          const isRedirect =
            nvdControls?.redirectCheckout?.noProtection ?? false
          if (isRedirect) {
            window.location.href = window.location.origin + '/checkout'
          } else {
            return
          }
        } else {
          addProtection(variantId).then((cart) => {
            return
          })
        }
      } else {
        return
      }
    }
  )
} else {
  // Code for desktop devices
  window.addEventListener(
    'click',
    nvdDebounce((ev) => {
      const navidiumTriggers = Array.from(
        document.querySelectorAll(nvdControls.CheckoutBtns)
      )
      const elm = ev.target
      if (navidiumTriggers.includes(elm)) {
        nvdCursorEvent('disabled')
        ev.preventDefault()
        console.log('checkout button clicked')
        let checked = document
          .querySelector('#shippingProtectionCheckBox')
          .hasAttribute('checked')
        if (localStorage.getItem('nvdVariant') != null) {
          let variantId = localStorage.getItem('nvdVariant')
          if (!checked) {
            nvdCursorEvent('enabled')
            const isRedirect =
              nvdControls?.redirectCheckout?.noProtection ?? false
            if (isRedirect) {
              window.location.href = window.location.origin + '/checkout'
            } else {
              return
            }
          } else {
            addProtection(variantId).then((cart) => {
              return
            })
          }
        } else {
          nvdCursorEvent('enabled')
          return
        }
      }
    }),
    nvdControls.forceCheckout ?? false
  )
}

const injectNvdToCart = () => {
  if (nvdControls?.nvdInject?.status) {
    const parent = document?.querySelector(nvdControls?.nvdInject?.parent)
    const nvdContainer = document?.querySelector(
      nvdControls?.nvdInject?.container
    )
    const nvdDiv = document.createElement('div')
    nvdDiv.setAttribute('class', 'nvd-mini w-nvd-100')

    if (nvdContainer) {
      if (!parent?.innerHTML.includes('nvd-mini')) {
        nvdContainer?.parentNode?.insertBefore(nvdDiv, nvdContainer)
      }
    }
  }
}