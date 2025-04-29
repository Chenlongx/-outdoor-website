// const paypalButtons = window.paypal.Buttons({
//     style: {
//          shape: "rect",
//          layout: "vertical",
//          color: "gold",
//          label: "paypal",
//      },
//     message: {
//          amount: 100,
//      },
//     async createOrder() {
//          try {
//              const response = await fetch("/.netlify/functions/orders", {
//                  method: "POST",
//                  headers: {
//                      "Content-Type": "application/json",
//                  },
//                  // use the "body" param to optionally pass additional order information
//                  // like product ids and quantities
//                  body: JSON.stringify({
//                      cart: [
//                          {
//                              id: "YOUR_PRODUCT_ID",
//                              quantity: "YOUR_PRODUCT_QUANTITY",
//                          },
//                      ],
//                  }),
//              });

//              const orderData = await response.json();

//              if (orderData.id) {
//                  return orderData.id;
//              }
//              const errorDetail = orderData?.details?.[0];
//              const errorMessage = errorDetail
//                  ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
//                  : JSON.stringify(orderData);

//              throw new Error(errorMessage);
//          } catch (error) {
//              console.error(error);
//              // resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
//          }
//      },
//     async onApprove(data, actions) {
//          try {
//              const response = await fetch(
//                  `/api/orders/${data.orderID}/capture`,
//                  {
//                      method: "POST",
//                      headers: {
//                          "Content-Type": "application/json",
//                      },
//                  }
//              );

//              const orderData = await response.json();
//              // Three cases to handle:
//              //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
//              //   (2) Other non-recoverable errors -> Show a failure message
//              //   (3) Successful transaction -> Show confirmation or thank you message

//              const errorDetail = orderData?.details?.[0];

//              if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
//                  // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
//                  // recoverable state, per
//                  // https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
//                  return actions.restart();
//              } else if (errorDetail) {
//                  // (2) Other non-recoverable errors -> Show a failure message
//                  throw new Error(
//                      `${errorDetail.description} (${orderData.debug_id})`
//                  );
//              } else if (!orderData.purchase_units) {
//                  throw new Error(JSON.stringify(orderData));
//              } else {
//                  // (3) Successful transaction -> Show confirmation or thank you message
//                  // Or go to another URL:  actions.redirect('thank_you.html');
//                  const transaction =
//                      orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
//                      orderData?.purchase_units?.[0]?.payments
//                          ?.authorizations?.[0];
//                  resultMessage(
//                      `Transaction ${transaction.status}: ${transaction.id}<br>
//            <br>See console for all available details`
//                  );
//                  console.log(
//                      "Capture result",
//                      orderData,
//                      JSON.stringify(orderData, null, 2)
//                  );
//              }
//          } catch (error) {
//              console.error(error);
//              resultMessage(
//                  `Sorry, your transaction could not be processed...<br><br>${error}`
//              );
//          }
//      },


//  });
//  paypalButtons.render("#paypal-button-container");


//  // Example function to show a result to the user. Your site's UI library can be used instead.
//  function resultMessage(message) {
//      const container = document.querySelector("#result-message");
//      container.innerHTML = message;
//  }



{
    "id": "57318616VC625012C",
        "intent": "CAPTURE",
            "status": "COMPLETED",
                "purchase_units": [
                    {
                        "reference_id": "default",
                        "amount": {
                            "currency_code": "USD",
                            "value": "156.50",
                            "breakdown": {
                                "item_total": {
                                    "currency_code": "USD",
                                    "value": "156.50"
                                },
                                "shipping": {
                                    "currency_code": "USD",
                                    "value": "0.00"
                                },
                                "handling": {
                                    "currency_code": "USD",
                                    "value": "0.00"
                                },
                                "insurance": {
                                    "currency_code": "USD",
                                    "value": "0.00"
                                },
                                "shipping_discount": {
                                    "currency_code": "USD",
                                    "value": "0.00"
                                }
                            }
                        },
                        "payee": {
                            "email_address": "sb-3qows39901169@business.example.com",
                            "merchant_id": "RNB6FC5VUN2Z4"
                        },
                        "description": "Protective goggles",
                        "items": [
                            {
                                "name": "Protective goggles",
                                "unit_amount": {
                                    "currency_code": "USD",
                                    "value": "2.50"
                                },
                                "tax": {
                                    "currency_code": "USD",
                                    "value": "0.00"
                                },
                                "quantity": "1"
                            },
                            {
                                "name": "Portable Automatic Quick-Setup UV-Resistant Waterproof Foldable Two-Person Tent for Outdoor Camping and Fishing",
                                "unit_amount": {
                                    "currency_code": "USD",
                                    "value": "140.00"
                                },
                                "tax": {
                                    "currency_code": "USD",
                                    "value": "0.00"
                                },
                                "quantity": "1"
                            },
                            {
                                "name": "Large-Capacity 304 Stainless Steel Beer Mug – Portable, Car-Compatible, Insulated Thermal Tumbler",
                                "unit_amount": {
                                    "currency_code": "USD",
                                    "value": "9.00"
                                },
                                "tax": {
                                    "currency_code": "USD",
                                    "value": "0.00"
                                },
                                "quantity": "1"
                            },
                            {
                                "name": "Foldable Climbing Cane",
                                "unit_amount": {
                                    "currency_code": "USD",
                                    "value": "5.00"
                                },
                                "tax": {
                                    "currency_code": "USD",
                                    "value": "0.00"
                                },
                                "quantity": "1"
                            }
                        ],
                        "shipping": {
                            "name": {
                                "full_name": "Doe John"
                            },
                            "address": {
                                "address_line_1": "NO 1 Nan Jin Road",
                                "admin_area_2": "Shanghai",
                                "admin_area_1": "Shanghai",
                                "postal_code": "200000",
                                "country_code": "C2"
                            }
                        },
                        "payments": {
                            "captures": [
                                {
                                    "id": "5NH39129G0621815A",
                                    "status": "COMPLETED",
                                    "amount": {
                                        "currency_code": "USD",
                                        "value": "156.50"
                                    },
                                    "final_capture": true,
                                    "seller_protection": {
                                        "status": "ELIGIBLE",
                                        "dispute_categories": [
                                            "ITEM_NOT_RECEIVED",
                                            "UNAUTHORIZED_TRANSACTION"
                                        ]
                                    },
                                    "create_time": "2025-04-29T03:35:08Z",
                                    "update_time": "2025-04-29T03:35:08Z"
                                }
                            ]
                        }
                    }
                ],
                    "payer": {
        "name": {
            "given_name": "John",
                "surname": "Doe"
        },
        "email_address": "sb-kyugw39133561@personal.example.com",
            "payer_id": "MQXHPSCZ7YKUY",
                "address": {
            "country_code": "C2"
        }
    },
    "create_time": "2025-04-29T03:34:58Z",
        "update_time": "2025-04-29T03:35:08Z",
            "links": [
                {
                    "href": "https://api.sandbox.paypal.com/v2/checkout/orders/57318616VC625012C",
                    "rel": "self",
                    "method": "GET"
                }
            ]
}