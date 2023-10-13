# CodeWich

[![Build Status]](https://travis-ci.org/calebegg/codewich)

[Build Status]: https://travis-ci.org/calebegg/codewich.svg?branch=master

CodeWich is a web app you can use to write small, self-contained snippets of
TypeScript/JavaScript, CSS, and HTML, and to preview a simple page that combines
them. The preview updates live as you type. It's similar to JSFiddle, JSBin,
CodePen, and others.

This is not an official Google product.

## Features

- Native support for TypeScript, including error highlighting and
  autocompletion.
- Your code is automatically run as you type.
- Code snippets you write are automatically saved in a compressed form in the
  URL. This has a few benefits:
  - Your code never leaves your machine unless you decide to share your URL.
    Since the snippet is stored in the URL fragment (the part after the
    `#`), the CodeWich web server doesn't even log your code snippets.
  - You don't have to rely on CodeWich's availability. You can [download
    your own copy] and run it locally, or host it somewhere you control, and
    you'll always be able to decode your CodeWich URLs to get the original
    code.

[download your own copy]: https://github.com/calebegg/codewich/releases/latest

## Demos

- [Flocking] (canvas)
- [Card flip] (CSS)
- [99 bottles of beer] (text)
- [Bouncing balls] (canvas)
- [Draw tiling patterns] (canvas)
- [Spirograph] (canvas)
- [Zigzag border] (CSS)

## CodeWich uses

- [Pako] for compression
- [Loop Protect] from [JSBin] to prevent accidental infinite for/while loops
  from breaking your tab.
- [Firebase] for static hosting

[Pako]: https://github.com/nodeca/pako
[Loop Protect]: https://github.com/jsbin/loop-protect
[JSBin]: https://jsbin.com/
[Firebase]: https://firebase.google.com/docs/hosting/

## Development

```bash
$ npm install
```

### Running locally

```bash
$ npx parcel serve src/index.html
```

### Deploying

```bash
$ npx parcel build src/index.html
$ npx firebase deploy -P qa
$ npx firebase deploy -P prod
```

[Bouncing balls]: https://codewich.com/#v1,,,bVJtT4MwEPbzfsWJmrV7QdhLMmXsg4uJSzQx6g9YRzsgMkhYNyHb_rtXygTUBsrd8dxzT.8aCQkeuEB44u02IpamL.RjJJT5kC84aXss3rNtmwLbwtPHy_O88EsIbUFtqdx5EkuRSdIe8Da9dFqtCCtkWMHqQa4_vHR56Qc7gcad09oKucDsdM8iQii4MzgU_OEaSAFCFC1jannmOoyid5lHisBI_RUjY7sH59ccUcP5hX4TniRYFJ.xpTdaYbQUqwooqS9MBmbKYp5sUFUHRpYFXUysUPk_qMEfFP.PzLagD.MaSHH1Rzpw.jl.BjMYjS04HlHSFGmppuvzzPkB5RpUb5Gmw70D5qQuuOviv4a2jtuAYCu63cptziAVcpfGdZHNWSyDbcTI9UFlqIadejCxbnpo4WbTpVPmrIQfxq_YEkLPIZZ6JMO7okZTjKno2OtCtbQEZYX68uCNo_DCM22npklRY30b53yxShChu7Ni3qefJruY38PVcDhE0MVUX3YIuWto04CvkMvANfCeGBCI0A.kdmbTWw2ZfQM
[Draw tiling patterns]: https://codewich.com/#v1,,,jZJRT4MwEMd95lOcS0zBTawkexljPhgfTDRZ3Is.snIbjYVG1m0uC9_dK2XITEy8kHJcf727_xWFBkRa7tINJJBpsS2wNOHnFqvDAhUKoyufOYAFl7GnLE.oC4VrNA.6NPhlfBZlDeGtdAW.5Sq9J5LHjTOFceMMhwEcPSDrOKGV46zTcOT8cNbkCnyb5QoiSJIGJLdPWBPhSir1Sl038DXccT5q4NY9LUHcnas9t9ae12pKs.xxR1N4lhuDJZL.Qm83WOgdshEgJDMq.0vkTfRPlRb8W6YTsDAHRWWc4qGV2cr27ckucA9sqVLxwWACbJ9LgyzuZVriWpbz1OR.0A.nlfAxFEqSwjebh3NK2RvXafO92zwb4AjoeaG04fyJotFZctv9qRyN1L68Oogvljo7wBGKtKKeJvaq64tp.9vtZWbyZDDmfAA5ynVu3MdseuuI2Tc
[99 bottles of beer]: https://codewich.com/#v1,,,lY5BDoIwFERZc4pZmBQSMbJEKN7AlQeg6Cc2lpa0JSwId7eYGKOJC2czk_z8N9MZi0SRhwRHUZTBa.yDZVmKOUbQ1VzGnrTfTVZ6UjppqqF.XlZtZrmgNd4rChGcc.Q4gjEcwBxbYDq0RBZGw98Ik1Cqau3_gI.ns7hTIFIYN.ktBuEcpIewZtTXb_ybeTLojaUVLZEhfxW7XyubtIyXKHoA
[Card flip]: https://codewich.com/#v1,,,tVNdb4IwFPXZX9GQLNFEHB8zcfjxQ_ZW6BVurNymrahZ9t9XQJ2g2XxZCSW5nHN67rkwEFhNNxJVxrVgn0PmliKDFqlMmAbJLVawaOo7rnN01TAI1LEtCTRK8lPCsJRYgp9KyraL4ddw2NFdO2B1Vi8A88J2VA4obNGpWM3LiwkuJZtGM8OAG_Cx9GlvW5QCbRRktUOfNLbmZsFLs90IbUjvfGNPEhKmNBjQjhCLFpHS0TcFF3RIWMBCdWSxu3We8lEwaa5pGI0nDfZ2tdioj43exmddnm03PAO_QoMpSrQupgKFgPInIE2lPedydZrc9jWK61DGV0atejcmnhqSe3sekyXlOln8LdpvSZPlFmLhemHhhLndD.eBgHx8N9GkoAp0Z669HN_rIOf9dOLgcZIzBwzvs4x.P_n5_PpnNmD3bcPHKHwyi2eiuB3P__kJen4Gy3oKmeTGrLyLLW_dSHRe1Wl5rPkRVl5tNde0L0XCBIkcdCr3sPDWy1fHuWfX.IdkSztu6YfYPr4B
[Flocking]: https://codewich.com/#v1,,,lVZLb5tAEM7Zv2KaHgyxswEkV0mwfeklOVSKmko5IA4bWNuoGBy8dkCR_3tndsE8bBoliZxl5pvXNzNrYiEh4Mmeb2EGYRrs1iKR7G0nsuJZxCKQaWYMNWBofnMHMeERqkVsKeTPNJEil8bQCRUiSJOthJca8x6FclXJH2r5SkTLlXQHgwgdZAseCHjimYyCWMDHAPAnv4dkt34Vmasei_Zj2FGHDf1hUMbbqxKoOM8HLNLTiHGJ9D38rXLblNFrdJUPYQaLNAOD6s_Sd0RYrjpMwdGn0cgs0y5jss1uuzI839TpHc2DNNbmdNDmeKrNGy489Ot7qPUppV9crljGkzBdGyZcAZvANTBnMoY.ja9DH4iPY_xIR48wtm1ZdKpjHynQyX8gxV3fL2NqRFf6MFb9sMaqDdbB1D1gW5mlf8WzLLCpMxh.v729HSKXWyEfqet7HhtoP5uX8QOGwXn2G8s30Bf.YbgHdDZQakqf75e_.DKJ5C4klyVTR.bYmm8M1aE5dYVlItwFwjC8HPP2x.DlDh4cXwX1chiBEuB_Epq1n68ZtuNzwnC4weaqDyqgNQOfjdCXB6ZiR9NR81JPkNvCarVn.XA9a1GKorNI.xRp9_q8mgG7u.vzc05Lua8rz89vO470H6tQLq_AQa4bXlDQ9hEtwDjxMQe7y1M712aQm5Mc3D5Lu2Fpf255aD0F7FUso.QJl8gwT4nI6ZLEXuNa6Rka4aaewgqE0fzgTvbBArZO9.JPatAQm11dHCVKV_NKRKMTPdcNrlF2Yq1Xu5n_obxt2rO.gXRRXyzNZvTQQEYflPABC9y4DTjPAlXJGGx1Oahb6OkR83PMJm4RxXHXo94iZbGIU_xay4m0SQelF7OBKrqok8Ui0kaYKAtzunot.39Yu8IWXayyH51ZXN0U5rSgxXmofQaa64WzOvZK2JTlVRVNYVGlWwtpzQg9BcuszCaW1QUUFaDoAeS4myjWPq57fBwhRQuC32g4Az9M9.I1xVo.cPsynKR7uiUPF9PyjUa9ecwu0eoS9NuGfphPbzRi_g8
[Spirograph]: https://codewich.com/#v1,,,VVJNb4JAEO2ZXzH9kqUaXLXUVsRLTz00MbFJr0UYhXTdbZehhTT.9y4uGOVAmPfmzcx7QSBBEsufuIAIUpWUO5Tkf5eo6xUKTEhp5toG17sMHUc0AtNrMX.L9KwkYUXMHaeHlsQnHctCxIRsHPABmJdnlJtSJpQrCRvJKEOKZyDL3Rq1B38OmEcjlVqCPw2gD68xZX6iCtsKdzDyeeDBEO5DZ2_PqMwZshQiPFT1sXI2SgNrMKuNgIft5xzG3Mw6DF..mK.xWeXzUcf3oyM3hIf77rLEF7nE9zylzEybhCfgc_xlIFerUqZuixek1SeuqBZouI.sEOzmzy4YnuweTZ_2A3jktwOY8lvvoxu7xm0ul6aNeRbKN8AquIysQej1jNmu8oxgp37wTbFqAHWraMxrs7uL2musBtySTW66S.EYcausT8kil2ektXy.qrPbHLu_WKu0bkNbx8nn9pDLDK4nk0lDz9t_7beJMroKOL.CDPNtRrZYzIe2Y_EP
[Zigzag border]: https://codewich.com/#v1,,,XVHbbtswDO2zv4JwMajDfFFTeEuV2NuwFt3THvYHik3LQmXLkJQ62dB_n1zbaxK.CDwkdQ4Pr77JttfGQdg411uWprXunE2E1kIh76VNSt2mpbVfa95Kdcx_c4UDP7IVpeEmCHa6OsLfAHy03AjZMaCb4DUILJZO6m6uNShF4xisMtofNm_QSBQPC07pCTpRMZi5IviJ6gWdLDn8wj1GYHlnY4tG1idTVv5BBl.yhcDhwcVcSeE1ldg5NBOuZIfxhaB3wYnT_Sy61EobBtePPx4.r..n4R0vn4XR.65i8AYssTfqJqy440y2XGBqX8SnQ6s2e1evo63PwGedzclotPd5GIZkuEu0Ealfno79BAZZuSYnt5SS2bIxIcW2566BWiqVkw.ru0kQgSonLY1uKaiMRrF_szEjkBbb8b8i_Hgm0WCP3MUH2GnndAvXlH5f32dn28.lcwOWvksD_jvzerVd7l0qbm0eehfDwp9N6cRrmWpFcNk1sYXFk9bV7ognrf8A
