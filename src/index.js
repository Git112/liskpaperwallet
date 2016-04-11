
let arts = {
  'base': {
    image: '01',
    width: 780,
    height: 360,
    address: {
      qr: {
        size: 150,
        top: 45,
        left: 15
      },
      text: {
        width: 760,
        height: 20,
        lineHeight: '20px',
        padding: '0 5px',
        fontSize: 16,
        fontFamily: 'Inconsolata',
        top: 10,
        left: 10,
        textAlign: 'left'
      },
      label: {
        hide: false,
        top: 205,
        left: 10,
        lineHeight: '26px',
        fontSize: 22,
        fontFamily: 'Inconsolata',
        textShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)'
      }
    },
    passphrase: {
      qr: {
        size: 150,
        bottom: 45,
        right: 15
      },
      text: {
        width: 760,
        height: 20,
        lineHeight: '20px',
        padding: '0 5px',
        fontSize: 14,
        fontFamily: 'Inconsolata',
        bottom: 10,
        left: 10,
        textAlign: 'right'
      },
      label: {
        hide: false,
        bottom: 205,
        right: 10,
        lineHeight: '26px',
        fontSize: 22,
        fontFamily: 'Inconsolata',
        textShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)'
      }
    },
    amount: {
      label: {
        top: 40,
        left: 300,
        height: 30,
        lineHeight: '30px',
        paddingLeft: 8,
        fontSize: 14,
        fontFamily: 'Inconsolata',
        textShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)'
      }
    }
  },
  '01': {
    extend: 'base',
    image: '01'
  },
  '02': {
    extend: 'base',
    image: '02'
  }
}

let main = () => {
  let $btns_row = $('.btns').show()
  let $btns = $btns_row.find('.btn')
  let $enter_row = $('.enter')
  let $enter_text = $enter_row.find('input')
  let $enter_btn = $enter_row.find('.btn')
  let $after = $('.after')

  let start = function () {
    $enter_row.hide()
    $after.hide()

    let passphrase

    let build = () => {
      let lw = LiskWallet(passphrase)

      $('.passphrase').text(lw.passphrase)
      $('.address').text(lw.address)
      $('.publicKey').text(lw.publicKey)
      $('.privateKey').text(lw.privateKey)
      $('.passphraseHash').text(lw.hash)

      $('.qr_address').empty().qrcode({ render: 'image', size: 350, text: lw.address })
      $('.qr_passphrase').empty().qrcode({ render: 'image', size: 350, text: lw.passphrase })

      $('.papers .show-amount').prop('checked', false)
      $('.papers .btn-group button').remove()
      $('.amount_label').hide()

      for (let id in arts) {
        if (id === 'base') {
          continue
        }

        let extendArt = (id) => {
          if (id === 'base') {
            return arts[id]
          }

          if (!arts[id]) {
            return {}
          }

          return $.extend(true, {}, extendArt(arts[id].extend), arts[id])
        }

        $('<button>')
          .attr('type', 'button')
          .text(id)
          .addClass('btn btn-default')
          .click(function () {
            $(this).parent().find('.btn').removeClass('active btn-primary')
            $(this).addClass('active btn-primary')

            let art = extendArt(id)
            let amount = $('.show-amount').is(':checked') ? 'a' : ''

            $('.paper img').attr('src', `images/${art.image}${amount}.png`)

            $('.paper-wrapper, .paper').css({
              width: art.width,
              height: art.height
            })

            $('.qr_address_paper')
              .empty()
              .css(art.address.qr)
              .qrcode({
                render: 'image',
                size: art.address.qr.size,
                text: lw.address
              })

            $('.qr_passphrase_paper')
              .empty()
              .css(art.passphrase.qr)
              .qrcode({
                render: 'image',
                size: art.passphrase.qr.size,
                text: lw.passphrase
              })

            $('.paper .address').css(art.address.text)
            $('.paper .passphrase').css(art.passphrase.text)

            if (art.address.label.hide) {
              $('.paper .address_label').hide()
            } else {
              $('.paper .address_label').css(art.address.label).show()
            }

            if (art.passphrase.label.hide) {
              $('.paper .passphrase_label').hide()
            } else {
              $('.paper .passphrase_label').css(art.passphrase.label).show()
            }

            $('.paper .amount_label').css(art.amount.label)
          })
          .appendTo($('.papers .btn-group'))
      }

      $('.papers .btn-group button:first').click()
      $after.show()
    }

    if ($(this).hasClass('btn_random')) {
      $btns_row.hide()

      balls(
        window.location.protocol === 'filae:' ? 10 : 75 + parseInt(Math.random() * 25),
        function () {
          passphrase = LiskWallet.generateMnemonic()
        },
        () => {
          $btns_row.show()
          build()
        }
      )
    } else {
      $enter_btn.attr('disabled', 1)
      $enter_row.show()

      let $form = $enter_row.parent().removeClass('has-success has-error')

      let fix = v => v.replace(/ +/g, ' ').trim().toLowerCase()

      let error = function (err) {
        $enter_btn.attr('disabled', err)

        if (err) {
          $form.removeClass('has-success').addClass('has-error')
        }
        else {
          $form.removeClass('has-error').addClass('has-success')
        }
      }

      $enter_text.val('').focus().unbind('keyup').keyup(function (e) {
        let value = fix($enter_text.val())

        if (value.split(' ').length !== 12 || !LiskWallet.validateMnemonic(value)) {
          error(true)
        }
        else {
          error(false)

          if (e.keyCode === 13)
            $enter_btn.click()
        }
      })

      $enter_btn.unbind('click').click(function () {
        passphrase = fix($enter_text.val())
        $(this).attr('disabled', 1)
        $enter_row.hide()
        build()
      })
    }
  }

  $btns.click(start)

  $('.hash').click(function () {
    let range, selection

    if (window.getSelection) {
       selection = window.getSelection()
       range = document.createRange()
       range.selectNodeContents(this)
       selection.removeAllRanges()
       selection.addRange(range)
    }
    else if (document.body.createTextRange) {
       range = document.body.createTextRange()
       range.moveToElementText(this)
       range.select()
    }
  })

  $('.btn-print').click(() => {
    window.print()
  })

  $('.papers').find('.btn').click(function () {
    let $this = $(this)

    $this.parent().find('.btn').removeClass('active')
    $this.addClass('active')
  })

  $('.papers .show-amount')
    .change(function () {
      let $cb = $(this)

      $('.paper img').each(function () {
        if ($cb.is(':checked')) {
          $(this).attr('src', $(this).attr('src').replace(/\.(.+)$/, 'a.$1'))
          $('.amount_label').show()
        } else {
          $(this).attr('src', $(this).attr('src').replace(/a\.(.+)$/, '.$1'))
          $('.amount_label').hide()
        }
      })
    })
}

jQuery(main)

function balls (total, it, cb) {
  let $doc = $(document)
  let $body = $('body')
  let $pb = $('.progress-bar').css('width', 0)
  let $ct = $('.bar').show()

  let px = 0
  let count = 0

  let listener = function (ev) {
    px++

    if (px > 5) {
      px = 0

      count++
      $pb.css('width', (count / total * 100) + '%')

      $('<div />')
        .css('top', ev.clientY)
        .css('left', ev.clientX)
        .addClass('ball')
        .appendTo($body)

      it()

      if (count >= total) {
        cb()
        $doc.unbind('mousemove', listener)
        $('.ball, .ball').hide().remove()
        $ct.hide()
      }
    }
  }

  $doc.mousemove(listener)
}
