jb.ns('gsmArena','html-parsing')

jb.component('html-parsing.main', { /* htmlParsing.main */
  type: 'control',
  impl: group({
    controls: [
      itemlist({
        items: pipeline('%$phone%', keys()),
        controls: [
          text({title: 'property', text: '%%', features: field.columnWidth('200')}),
          text({title: 'value', text: pipeline('%$phone/{%%}%')})
        ],
        style: table.withHeaders(),
        features: [css.width('446')]
      }),
      itemlist({
        items: '%$phone/spec-list%',
        controls: [
          text({title: 'feature', text: '%feature%'}),
          text({title: 'value', text: '%val%'})
        ],
        style: table.withHeaders(),
        features: [css.width('400')]
      })
    ],
    features: variable({
      name: 'phone',
      value: pipeline('%$samsung_galaxy_m30s-9818%', gsmArena.deviceParser())
    })
  })
})

jb.component('gsm-arena.device-parser', { /* gsmArena.deviceParser */
  impl: obj(
    prop(
        'name',
        extractText({
          startMarkers: '<h1 class=\"specs-phone-name-title\" data-spec=\"modelname\">',
          endMarker: '</h1>'
        })
      ),
    prop(
        'image',
        extractText({
          startMarkers: ['<div class=\"specs-photo-main\">', '<a href=\"', 'src=\"'],
          endMarker: '\"'
        })
      ),
    prop(
        'spec-list',
        pipeline(
          extractText({
              startMarkers: ['id=\"specs-list'],
              endMarker: 'class=\"note\"',
              repeating: 'true'
            }),
          extractText({
              startMarkers: 'class=\"ttl\">',
              endMarker: '</tr>',
              repeating: 'true'
            }),
          obj(
              prop('feature', extractText({startMarkers: '\">', endMarker: '<'})),
              prop('val', extractText({startMarkers: ['data-spec=', '\">'], endMarker: '<'}))
            )
        ),
        'array'
      )
  )
})



jb.component('html-parsing.makeToDevices', { /* htmlParsing.makeToDevices */
  type: 'control',
  impl: group({
    controls: [
      button({
        title: 'parse make',
        action: writeValue(
          '%$deviceUrls%',
          pipeline(
            '%$sampleMakePage%',
            extractText({startMarkers: 'class=\"makers\"', endMarker: '</ul>'}),
            extractText({startMarkers: '<a href=\"', endMarker: '.php', repeating: 'true'})
          )
        )
      }),
      button({
        title: 'crawl - devices url - parse device - store in results',
        action: runActionOnItems(
          pipeline('%$deviceUrls%', slice('0', '5')),
          runActions(
            writeValueAsynch(
                '%$devices/{%%}%',
                pipe(
                  http.get(
                      'http://jbartdb.appspot.com/jbart_db.js?op=proxy&url=https://www.gsmarena.com/%%.php'
                    ),
                  gsmArena.deviceParser()
                )
              ),
            writeValue('%$progress/{%%}%', 'done')
          )
        )
      }),
      itemlist({
        items: '%$deviceUrls%',
        controls: [
          text({title: 'url', text: '%%'}),
          text({
            title: 'status',
            text: pipeline('%$progress/{%%}%'),
            features: field.columnWidth('100')
          })
        ],
        style: table.mdl(),
        features: [css.width('600'), watchRef({ref: '%$progress%', includeChildren: 'yes'})]
      })
    ]
  })
})

jb.component('data-resource.sampleMakePage', { /* dataResource.sampleMakePage */
  passiveData: `

<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-US" lang="en-US">
<head>
<title>All Acer phones</title>




<script data-cfasync="false" type="text/javascript">(function(w, d) { var s = d.createElement('script'); s.src = '//delivery.adrecover.com/16425/adRecover.js?ts=1527752433225'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);</script>


<link rel="stylesheet" href="https://fdn.gsmarena.com/vv/assets10/css/gsmarena.css?v=83">

<link rel="shortcut icon" href="https://fdn.gsmarena.com/imgroot/static/favicon.ico">




<script type="text/javascript" src="//dsh7ky7308k4b.cloudfront.net/publishers/gsmarenacom.min.js"></script>

<script async='async' src='https://www.googletagservices.com/tag/js/gpt.js'></script>
<script>
  var googletag = googletag || {};
  googletag.cmd = googletag.cmd || [];
</script>

<script>
  googletag.cmd.push(function() {

	googletag.defineSlot('/8095840/.2_A.34912.3_gsmarena.com_tier1', [728, 90], 'div-gpt-ad-top728x90gsmarenadesktop-0').addService(googletag.pubads());

	googletag.defineSlot('/8095840/.2_A.35452.4_gsmarena.com_tier1', [300, 250], 'div-gpt-ad-gsmarenacom35452').addService(googletag.pubads());

	googletag.defineSlot('/8095840/.2_A.34911.7_gsmarena.com_tier1', [[300, 250], [300, 600]], 'div-gpt-ad-300x600btfgsmarenadesktop-0').addService(googletag.pubads());

	googletag.defineSlot('/8095840/.2_A.34913.3_gsmarena.com_tier1', [728, 90], 'div-gpt-ad-728x90bagsmarenadesktop-0').addService(googletag.pubads());



	googletag.enableServices();
  });
</script>
<link rel="stylesheet" href="https://fdn.gsmarena.com/vv/assets10/css/makers.css?v=24">

<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
<meta name="Description" content="List of Acer phones, smartphones and tablets">
<meta name="keywords" content="GSM,Acer,gsm,phone,cellphone,information,info,list">

<link rel="canonical" href="https://www.gsmarena.com/acer-phones-59.php">
<link rel="alternate" media="only screen and (max-width: 640px)" href="https://m.gsmarena.com/acer-phones-59.php">

</head>
<body>



<script type="text/javascript" src="https://fdn.gsmarena.com/vv/assets10/js/misc.js?v=45"></script>

<script language='JavaScript' type='text/javascript'>
function phpads_deliverActiveX(content)
{
	document.write(content);
}
</script>
<header id="header" class="row">
<div class="wrapper clearfix">
<div class="top-bar clearfix">
<!-- HAMBURGER MENU -->
<button type="button" role="button" aria-label="Toggle Navigation" class="lines-button minus focused">
<span class="lines"></span>
</button>
<!-- /HAMBURGER MENU -->



<!-- LOGO -->
<div id="logo">
<a href="/">

<object type="image/svg+xml" data="https://fdn.gsmarena.com/vv/assets10/i/logo.svg"><img src="https://fdn.gsmarena.com/vv/assets10/i/logo-fallback.gif" alt="GSMArena.com"></object>
<span>GSMArena.com</span></a>
</div>



<div id="nav" role="main">
<form action="res.php3" method="get" id="topsearch">
    <input type="text" placeholder="Search" tabindex="201" accesskey="s" id="topsearch-text" name="sSearch" autocomplete="off" />
    <span id="quick-search-button">
      <input type="submit" value="Go" />
      <i class="head-icon icomoon-liga icon-search-left"></i>
    </span>


</form>
</div>


<div id="social-connect">
<a href="tipus.php3" class="tip-icon">
  <i class="head-icon icon-tip-us icomoon-liga"></i><br><span class="icon-count">Tip us</span>
</a>
<a href="https://www.facebook.com/GSMArenacom-189627474421/" class="fb-icon" target="_blank" rel="noopener">
  <i class="head-icon icon-soc-fb2 icomoon-liga"></i><br><span class="icon-count">884k</span>
</a>
<a href="https://twitter.com/gsmarena_com" class="tw-icon" target="_blank" rel="noopener">
  <i class="head-icon icon-soc-twitter2 icomoon-liga"></i><br><span class="icon-count">149k</span>
</a>

<a href="https://www.instagram.com/gsmarenateam/" class="ig-icon" target="_blank" rel="noopener">
  <i class="head-icon icon-instagram icomoon-liga"></i>
  <span class="icon-count">NEW!</span>
</a>
<a href="https://www.youtube.com/channel/UCbLq9tsbo8peV22VxbDAfXA?sub_confirmation=1" class="yt-icon" target="_blank" rel="noopener">
  <i class="head-icon icon-soc-youtube icomoon-liga"></i><br><span class="icon-count">756k</span>
</a>
<a href="rss-news-reviews.php3" class="rss-icon">
  <i class="head-icon icon-soc-rss2 icomoon-liga"></i><br><span class="icon-count">RSS</span>
</a>




	<a href="#" onclick="return false;" class="login-icon" id="login-active">
	  <i class="head-icon icon-login"></i><br><span class="icon-count" style="right:4px;">Log in</span>
	</a>

	<span class="tooltip" id="login-popup2">
<form action="login.php3" method="post">
<input type="Hidden" name="sSource" value="MH58em0yb3dwcXpsMiomMW93bw%3D%3D">
	<p>Login</p>
	<label for="email"></label>
	<input type="email" id="email" name="sEmail" maxlength="50" value="" required="" autocomplete="false">

	<label for="upass"></label>
	<input type="password" id="upass" name="sPassword" placeholder="Your password" maxlength="20" pattern="\S{6,}" required="" autocomplete="false">

	<input class="button" type="submit" value="Log in" id="nick-submit">
</form>
	<a class="forgot" href="forgot.php3">I forgot my password</a>
	</span>
 <a href="register.php3" class="signup-icon no-margin-right"><i class="head-icon icon-user-plus"></i><span class="icon-count">Sign up</span></a>
              </div>
           </div>
<ul id="menu" class="main-menu-list">
	<li><a href="/">Home</a></li>
	<li><a href="news.php3">News</a></li>
	<li><a href="reviews.php3">Reviews</a></li>
  <li><a href="videos.php3">Videos</a></li>
	<li><a href="news.php3?sTag=Featured">Featured</a></li>
	<li><a href="search.php3">Phone Finder</a></li>
	<li><a href="tools.php3">Tools</a></li>
	<li><a href="glossary.php3">Glossary</a></li>
	<li><a href="network-bands.php3">Coverage</a></li>
	<li><a href="contact.php3">Contact</a></li>
</ul>



      <!-- SOCIAL CONNECT -->
    </div>


</header> <!--- HEADER END -->




<div id="wrapper" class="l-container">
<div id="outer" class="row">


<div id="subHeader" class="col">
<div id="topPromo">
		<div class="alt-display is-review" style="background-image: url(https://fdn.gsmarena.com/imgroot/reviews/19/apple-iphone-11-pro-max/-347x151/thumb6.jpg)">
		  <a class="table-cell reviews-xl-snazzy" href="apple_iphone_11_pro_max-review-1991.php">
			  <div class="module-review-xl-title">

			    	<strong>Apple iPhone 11 Pro and Pro Max review</strong>


		 	  </div>
		 </a>
	  </div>
</div><div id="topAdv" class="l-box" adonis-marker data-pan-sizes="[[728,90]]"><!-- /8095840/.2_A.34912.3_gsmarena.com_tier1 -->
<div id='div-gpt-ad-top728x90gsmarenadesktop-0' style='height:90px; width:728px;'>
<script>
googletag.cmd.push(function() { googletag.display('div-gpt-ad-top728x90gsmarenadesktop-0'); });
</script>
</div>
	</div>
</div>


<div id="body" class="clearfix">

<div class="main right main-maker l-box col">

<div class="review-header maker-header hreview">
<style type="text/css">
	.review-background {

		background-image: url('https://fdn.gsmarena.com/imgroot/static/headers/makers/acer-2.jpg');
		background-size: 728px 314px;
	}
</style>

<div class="review-hd overflow darken review-background">
<div class="article-info">
<div class="article-info-line border-bottom">
<div class="blur"></div>

</div>
<div class="center-stage blur color-accent article-accent">
<div class="article-hgroup">
<h1 class="article-info-name">Acer phones</h1>
</div>

</div>
<div class="article-info-line">
<div class="blur bottom"></div>
<!-- <p class="maker-order">
Order by:
<a href="#">Time of release</a> |
<a href="#">Popularity</a>
</p> -->
<ul class="article-info-meta">
<li class="article-info-meta-link help help-sort-popularity"><a href="acer-phones-f-59-0-r1-p1.php"><i class="head-icon icon-popularity"></i>Popularity</a></li>
<li class="article-info-meta-link help help-sort-release sort-active"><a href="#"><i class="head-icon icon-launched"></i>Time of release</a></li>
<li class="article-info-meta-link light large help help-review compare-button">
    <a href="#1"><i class="head-icon icon-compare"></i>Compare</a>
</li>
<li class="article-info-meta-link light large help left">
    <a href="news.php3?sTag=Acer"><i class="head-icon icon-in-the-news"></i>Acer news</a>
</li>
</ul>
</div>
</div>

</div>
</div>



<div id="review-body" class="section-body">
<div class="makers">
<ul>



<li><a href="acer_chromebook_tab_10-9139.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-chromebook-tab-10.jpg title="Acer Chromebook Tab 10 tablet. Announced Mar 2018. Features 9.7&Prime; IPS LCD display, Rockchip RK3399 chipset, 5 MP primary camera, 2 MP front camera, 4500 mAh battery, 32 GB storage, 4 GB RAM."><strong><span>Chromebook Tab 10</span></strong></a></li><li><a href="acer_iconia_talk_s-8306.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-iconia-talk-s.jpg title="Acer Iconia Talk S Android tablet. Announced Aug 2016. Features 7.0&Prime; IPS LCD display, MT8735 chipset, 13 MP primary camera, 2 MP front camera, 3400 mAh battery, 32 GB storage, 2 GB RAM."><strong><span>Iconia Talk S</span></strong></a></li><li><a href="acer_liquid_z6_plus-8305.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-z6-plus.jpg title="Acer Liquid Z6 Plus Android smartphone. Announced Aug 2016. Features 5.5&Prime; IPS LCD display, MT6753 chipset, 13 MP primary camera, 5 MP front camera, 4080 mAh battery, 32 GB storage, 3 GB RAM."><strong><span>Liquid Z6 Plus</span></strong></a></li><li><a href="acer_liquid_z6-8304.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-z6.jpg title="Acer Liquid Z6 Android smartphone. Announced Aug 2016. Features 5.0&Prime; IPS LCD display, MT6737 chipset, 8 MP primary camera, 2 MP front camera, 2000 mAh battery, 8 GB storage, 1000 MB RAM."><strong><span>Liquid Z6</span></strong></a></li><li><a href="acer_iconia_tab_10_a3_a40-8080.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-iconia-tab-10-a3-a40.jpg title="Acer Iconia Tab 10 A3-A40 Android tablet. Announced Apr 2016. Features 10.1&Prime; IPS LCD display, MT8163A chipset, 5 MP primary camera, 2 MP front camera, 6100 mAh battery, 64 GB storage, 2 GB RAM."><strong><span>Iconia Tab 10 A3-A40</span></strong></a></li><li><a href="acer_liquid_x2-8034.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-x2-1.jpg title="Acer Liquid X2 Android smartphone. Announced Apr 2015. Features 5.5&Prime; IPS LCD display, MT6753 chipset, 13 MP primary camera, 13 MP front camera, 4020 mAh battery, 32 GB storage, 3 GB RAM."><strong><span>Liquid X2</span></strong></a></li><li><a href="acer_liquid_jade_2-7956.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-jade-2.jpg title="Acer Liquid Jade 2 Android smartphone. Announced Feb 2016. Features 5.5&Prime; Super AMOLED display, Snapdragon 808 chipset, 21 MP primary camera, 8 MP front camera, 3000 mAh battery, 32 GB storage, 3 GB RAM, Corning Gorilla Glass 4."><strong><span>Liquid Jade 2</span></strong></a></li><li><a href="acer_liquid_zest_plus-8059.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-zest-plus-z628.jpg title="Acer Liquid Zest Plus Android smartphone. Announced Apr 2016. Features 5.5&Prime; IPS LCD display, MT6735 chipset, 13 MP primary camera, 5 MP front camera, 5000 mAh battery, 16 GB storage, 2 GB RAM."><strong><span>Liquid Zest Plus</span></strong></a></li><li><a href="acer_liquid_zest-7955.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-zest.jpg title="Acer Liquid Zest Android smartphone. Announced Feb 2016. Features 5.0&Prime; IPS LCD display, MT6580 chipset, 8 MP primary camera, 5 MP front camera, 2000 mAh battery, 8 GB storage, 1000 MB RAM."><strong><span>Liquid Zest</span></strong></a></li><li><a href="acer_predator_8-7750.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-predator-8.jpg title="Acer Predator 8 Android tablet. Announced Sep 2015. Features 8.0&Prime; IPS LCD display, Intel Atom x7-Z8700 chipset, 5 MP primary camera, 2 MP front camera, 4420 mAh battery, 64 GB storage, 2 GB RAM."><strong><span>Predator 8</span></strong></a></li><li><a href="acer_liquid_jade_primo-7650.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-jade-primo-.jpg title="Acer Liquid Jade Primo Windows Mobile smartphone. Announced Sep 2015. Features 5.5&Prime; AMOLED display, Snapdragon 808 chipset, 21 MP primary camera, 8 MP front camera, 2870 mAh battery, 32 GB storage, 3 GB RAM, Corning Gorilla Glass (unspecified version)."><strong><span>Liquid Jade Primo</span></strong></a></li><li><a href="acer_liquid_z330-7530.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-z320-z330.jpg title="Acer Liquid Z330 Android smartphone. Announced Sep 2015. Features 4.5&Prime; IPS LCD display, Snapdragon 210 chipset, 5 MP primary camera, 5 MP front camera, 2000 mAh battery, 8 GB storage, 1000 MB RAM."><strong><span>Liquid Z330</span></strong></a></li><li><a href="acer_liquid_z320-7531.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-z320-z330.jpg title="Acer Liquid Z320 Android smartphone. Announced Sep 2015. Features 4.5&Prime; IPS LCD display, Snapdragon 210 chipset, 5 MP primary camera, 2 MP front camera, 2000 mAh battery, 8 GB storage, 1000 MB RAM."><strong><span>Liquid Z320</span></strong></a></li><li><a href="acer_liquid_z630s-7529.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-z630.jpg title="Acer Liquid Z630S Android smartphone. Announced Sep 2015. Features 5.5&Prime; IPS LCD display, MT6753 chipset, 8 MP primary camera, 8 MP front camera, 4000 mAh battery, 32 GB storage, 3 GB RAM."><strong><span>Liquid Z630S</span></strong></a></li><li><a href="acer_liquid_z630-7528.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-z630.jpg title="Acer Liquid Z630 Android smartphone. Announced Sep 2015. Features 5.5&Prime; IPS LCD display, MT6735 chipset, 8 MP primary camera, 8 MP front camera, 4000 mAh battery, 16 GB storage, 2 GB RAM."><strong><span>Liquid Z630</span></strong></a></li><li><a href="acer_liquid_z530s-7527.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-z530.jpg title="Acer Liquid Z530S Android smartphone. Announced Sep 2015. Features 5.0&Prime; IPS LCD display, MT6753 chipset, 8 MP primary camera, 8 MP front camera, 2420 mAh battery, 32 GB storage, 3 GB RAM."><strong><span>Liquid Z530S</span></strong></a></li><li><a href="acer_liquid_z530-7526.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-z530.jpg title="Acer Liquid Z530 Android smartphone. Announced Sep 2015. Features 5.0&Prime; IPS LCD display, MT6735 chipset, 8 MP primary camera, 8 MP front camera, 2420 mAh battery, 16 GB storage, 2 GB RAM."><strong><span>Liquid Z530</span></strong></a></li><li><a href="acer_liquid_m330-7524.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-m320-m330.jpg title="Acer Liquid M330 Windows Mobile smartphone. Announced Sep 2015. Features 4.5&Prime; IPS LCD display, Snapdragon 210 chipset, 5 MP primary camera, 5 MP front camera, 2000 mAh battery, 8 GB storage, 1000 MB RAM."><strong><span>Liquid M330</span></strong></a></li><li><a href="acer_liquid_m320-7525.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-m320-m330.jpg title="Acer Liquid M320 Windows Mobile smartphone. Announced Sep 2015. Features 4.5&Prime; IPS LCD display, Snapdragon 210 chipset, 5 MP primary camera, 2 MP front camera, 2000 mAh battery, 8 GB storage, 1000 MB RAM."><strong><span>Liquid M320</span></strong></a></li><li><a href="acer_iconia_tab_10_a3_a30-7218.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-iconia-tab-10-a3-a30-new.png title="Acer Iconia Tab 10 A3-A30 Android tablet. Announced Apr 2015. Features 10.1&Prime; LED-backlit IPS LCD display, Intel Atom Z3735F chipset, 5 MP primary camera, 2 MP front camera, 5910 mAh battery, 64 GB storage, 2 GB RAM, Corning Gorilla Glass 4."><strong><span>Iconia Tab 10 A3-A30</span></strong></a></li><li><a href="acer_iconia_one_8_b1_820-7217.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-iconia-one-8-b1-820.jpg title="Acer Iconia One 8 B1-820 Android tablet. Announced Apr 2015. Features 8.0&Prime; IPS LCD display, Intel Atom Z3735G chipset, 5 MP primary camera, 4550 mAh battery, 32 GB storage, 1000 MB RAM."><strong><span>Iconia One 8 B1-820</span></strong></a></li><li><a href="acer_iconia_tab_a3_a20-7136.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-a3-20.jpg title="Acer Iconia Tab A3-A20 Android tablet. Announced Oct 2014. Features 10.1&Prime; LED-backlit IPS LCD display, MT8127 chipset, 5 MP primary camera, 2 MP front camera, 5910 mAh battery, 16 GB storage, 1000 MB RAM, Corning Gorilla Glass 4."><strong><span>Iconia Tab A3-A20</span></strong></a></li><li><a href="acer_iconia_tab_a3_a20fhd-7135.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-a3-20.jpg title="Acer Iconia Tab A3-A20FHD Android tablet. Announced Oct 2014. Features 10.1&Prime; LED-backlit IPS LCD display, MT8127 chipset, 5 MP primary camera, 2 MP front camera, 5910 mAh battery, 32 GB storage, 2 GB RAM, Corning Gorilla Glass 4."><strong><span>Iconia Tab A3-A20FHD</span></strong></a></li><li><a href="acer_liquid_jade_z-7072.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-jade-z.jpg title="Acer Liquid Jade Z Android smartphone. Announced Mar 2015. Features 5.0&Prime; IPS LCD display, MT6732 chipset, 13 MP primary camera, 5 MP front camera, 2300 mAh battery, 16 GB storage, 2 GB RAM, Corning Gorilla Glass 3."><strong><span>Liquid Jade Z</span></strong></a></li><li><a href="acer_liquid_z520-7073.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-z520.jpg title="Acer Liquid Z520 Android smartphone. Announced Mar 2015. Features 5.0&Prime; TFT display, MT6582M chipset, 8 MP primary camera, 2 MP front camera, 2000 mAh battery, 16 GB storage, 2 GB RAM."><strong><span>Liquid Z520</span></strong></a></li><li><a href="acer_liquid_z220-7074.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-z220.jpg title="Acer Liquid Z220 Android smartphone. Announced Mar 2015. Features 4.0&Prime;  display, Snapdragon 200 chipset, 5 MP primary camera, 2 MP front camera, 1300 mAh battery, 8 GB storage, 1000 MB RAM."><strong><span>Liquid Z220</span></strong></a></li><li><a href="acer_liquid_m220-7071.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-m220.jpg title="Acer Liquid M220 Windows Mobile smartphone. Announced Mar 2015. Features 4.0&Prime; TFT display, Snapdragon 200 chipset, 5 MP primary camera, 2 MP front camera, 1300 mAh battery, 8 GB storage, 1000 MB RAM."><strong><span>Liquid M220</span></strong></a></li><li><a href="acer_liquid_z410-6912.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-z410.jpg title="Acer Liquid Z410 Android smartphone. Announced Jan 2015. Features 4.5&Prime; IPS LCD display, MT6732M chipset, 5 MP primary camera, 2 MP front camera, 2000 mAh battery, 16 GB storage, 2 GB RAM."><strong><span>Liquid Z410</span></strong></a></li><li><a href="acer_liquid_jade_s-6864.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-jade-s-s56.jpg title="Acer Liquid Jade S Android smartphone. Announced Dec 2014. Features 5.0&Prime; IPS LCD display, MT6752M chipset, 13 MP primary camera, 5 MP front camera, 2300 mAh battery, 16 GB storage, 2 GB RAM, Corning Gorilla Glass 3."><strong><span>Liquid Jade S</span></strong></a></li><li><a href="acer_liquid_z500-6635.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-z5.jpg title="Acer Liquid Z500 Android smartphone. Announced Sep 2014. Features 5.0&Prime; IPS LCD display, MT6582 chipset, 8 MP primary camera, 2 MP front camera, 2000 mAh battery, 16 GB storage, 2 GB RAM, Corning Gorilla Glass 3."><strong><span>Liquid Z500</span></strong></a></li><li><a href="acer_liquid_x1-6419.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-x1.jpg title="Acer Liquid X1 Android smartphone. Announced Jun 2014. Features 5.7&Prime; IPS LCD display, MT6592 chipset, 13 MP primary camera, 2 MP front camera, 2700 mAh battery, 16 GB storage, 2 GB RAM, Corning Gorilla Glass 3."><strong><span>Liquid X1</span></strong></a></li><li><a href="acer_liquid_jade-6423.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-jade.jpg title="Acer Liquid Jade Android smartphone. Announced Jun 2014. Features 5.0&Prime; IPS LCD display, MT6582 chipset, 13 MP primary camera, 2 MP front camera, 2100 mAh battery, 16 GB storage, 2 GB RAM, Corning Gorilla Glass 3."><strong><span>Liquid Jade</span></strong></a></li><li><a href="acer_liquid_e700-6420.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-e700.jpg title="Acer Liquid E700 Android smartphone. Announced Jun 2014. Features 5.0&Prime; IPS LCD display, MT6582 chipset, 8 MP primary camera, 2 MP front camera, 3500 mAh battery, 16 GB storage, 2 GB RAM."><strong><span>Liquid E700</span></strong></a></li><li><a href="acer_liquid_e600-6421.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-e600-1.jpg title="Acer Liquid E600 Android smartphone. Announced Jun 2014. Features 5.0&Prime; IPS LCD display, Snapdragon 400 chipset, 8 MP primary camera, 2 MP front camera, 2500 mAh battery, 16 GB storage, 2 GB RAM."><strong><span>Liquid E600</span></strong></a></li><li><a href="acer_liquid_z200-6422.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-z200.jpg title="Acer Liquid Z200 Android smartphone. Announced Jun 2014. Features 4.0&Prime; TFT display, MT6572M chipset, 2 MP primary camera, 1300 mAh battery, 4 GB storage, 512 MB RAM."><strong><span>Liquid Z200</span></strong></a></li><li><a href="acer_iconia_tab_8_a1_840fhd-6424.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-iconia-tab-8-2014-1.jpg title="Acer Iconia Tab 8 A1-840FHD Android tablet. Announced Jun 2014. Features 8.0&Prime; IPS LCD display, Intel Atom Z3745 chipset, 5 MP primary camera, 2 MP front camera, 4600 mAh battery, 32 GB storage, 2 GB RAM."><strong><span>Iconia Tab 8 A1-840FHD</span></strong></a></li><li><a href="acer_iconia_tab_7_a1_713hd-6342.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-iconia-tab-7.jpg title="Acer Iconia Tab 7 A1-713HD Android tablet. Announced Apr 2014. Features 7.0&Prime; IPS LCD display, 5 MP primary camera, 3400 mAh battery, 16 GB storage, 1000 MB RAM."><strong><span>Iconia Tab 7 A1-713HD</span></strong></a></li><li><a href="acer_iconia_tab_7_a1_713-6343.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-iconia-tab-7.jpg title="Acer Iconia Tab 7 A1-713 Android tablet. Announced Apr 2014. Features 7.0&Prime; TFT display, 2 MP primary camera, 3400 mAh battery, 16 GB storage, 1000 MB RAM."><strong><span>Iconia Tab 7 A1-713</span></strong></a></li><li><a href="acer_iconia_one_7_b1_730-6341.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-iconia-one-7.jpg title="Acer Iconia One 7 B1-730 Android tablet. Announced Apr 2014. Features 7.0&Prime; IPS LCD display, Intel Atom Z2560 chipset, 5 MP primary camera, 3700 mAh battery, 8 GB storage, 1000 MB RAM."><strong><span>Iconia One 7 B1-730</span></strong></a></li><li><a href="acer_liquid_e3_duo_plus-6680.php"><img src=https://fdn2.gsmarena.com/vv/bigpic/acer-liquid-e3-plus.jpg title="Acer Liquid E3 Duo Plus Android smartphone. Announced Q3 2014. Features 4.7&Prime; IPS LCD display, MT6589 chipset, 13 MP primary camera, 2 MP front camera, 2000 mAh battery, 16 GB storage, 2 GB RAM."><strong><span>Liquid E3 Duo Plus</span></strong></a></li>


</ul>
<br class="clear">
</div>

<div class="adv bottom-728">
<!-- /8095840/.2_A.34913.3_gsmarena.com_tier1 -->
<!-- 728x90ba -->
<div id='div-gpt-ad-728x90bagsmarenadesktop-0' style='height:90px; width:728px;'>
<script>
googletag.cmd.push(function() { googletag.display('div-gpt-ad-728x90bagsmarenadesktop-0'); });
</script>
</div>
	</div>

</div>

<br class="clearfix">




<div class="review-nav pullNeg col pushT10 ">

<div class="nav-pages">
<span>Pages:</span>
<strong>1</strong> <a href="acer-phones-f-59-0-p2.php">2</a>  <a href="acer-phones-f-59-0-p3.php">3</a> </div>
<div class="col col-1-5 pages-next-prev float-right">
<a class="disabled pages-prev" href="#1" title="Previous page"></a> <a class="pages-next" href="acer-phones-f-59-0-p2.php" title="Next page"></a>
</div>



</div>




<!-- <div id="body-top-nav-empty">
</div> -->





</div>

<aside class="sidebar col left">

<div class="brandmenu-v2 light l-box clearfix">
<p class="pad">
<a href="search.php3" class="pad-single pad-finder">
<i class="head-icon icon-search-right"></i>
<span>Phone finder</span></a>
</p>
<ul>
<li><a href="samsung-phones-9.php">Samsung</a></li><li><a href="apple-phones-48.php">Apple</a></li><li><a href="huawei-phones-58.php">Huawei</a></li><li><a href="nokia-phones-1.php">Nokia</a></li><li><a href="sony-phones-7.php">Sony</a></li><li><a href="lg-phones-20.php">LG</a></li><li><a href="htc-phones-45.php">HTC</a></li><li><a href="motorola-phones-4.php">Motorola</a></li><li><a href="lenovo-phones-73.php">Lenovo</a></li><li><a href="xiaomi-phones-80.php">Xiaomi</a></li><li><a href="google-phones-107.php">Google</a></li><li><a href="honor-phones-121.php">Honor</a></li><li><a href="oppo-phones-82.php">Oppo</a></li><li><a href="realme-phones-118.php">Realme</a></li><li><a href="oneplus-phones-95.php">OnePlus</a></li><li><a href="vivo-phones-98.php">vivo</a></li><li><a href="meizu-phones-74.php">Meizu</a></li><li><a href="blackberry-phones-36.php">BlackBerry</a></li><li><a href="asus-phones-46.php">Asus</a></li><li><a href="alcatel-phones-5.php">Alcatel</a></li><li><a href="zte-phones-62.php">ZTE</a></li><li><a href="microsoft-phones-64.php">Microsoft</a></li><li><a href="vodafone-phones-53.php">Vodafone</a></li><li><a href="energizer-phones-106.php">Energizer</a></li><li><a href="cat-phones-89.php">Cat</a></li><li><a href="sharp-phones-23.php">Sharp</a></li><li><a href="micromax-phones-66.php">Micromax</a></li><li><a href="blu-phones-67.php">BLU</a></li><li><a href="acer-phones-59.php">Acer</a></li><li><a href="infinix-phones-119.php">Infinix</a></li><li><a href="tecno-phones-120.php">Tecno</a></li><li><a href="wiko-phones-96.php">Wiko</a></li><li><a href="panasonic-phones-6.php">Panasonic</a></li><li><a href="yu-phones-100.php">YU</a></li><li><a href="verykool-phones-70.php">verykool</a></li><li><a href="plum-phones-72.php">Plum</a></li></ul>

<p class="pad">
<a href="makers.php3" class="pad-multiple pad-allbrands">
  <i class="head-icon icon-mobile-phone231"></i>
  <span>All brands</span>
</a>
<a href="rumored.php3" class="pad-multiple pad-rumormill">
  <i class="head-icon icon-rumored"></i>
  <span>Rumor mill</span>
</a>
</p>
</div>
<div class="adv banner-mpu" adonis-marker data-pan-sizes="[[300,250]]">
<!-- /8095840/.2_A.35452.4_gsmarena.com_tier1 -->
<div id='div-gpt-ad-gsmarenacom35452' style='height:250px; width:300px;'>
<script>
googletag.cmd.push(function() { googletag.display('div-gpt-ad-gsmarenacom35452'); });
</script>
</div>
	</div>



<div class="module reviews-xl-snazzy">
<h4 class="section-heading">Acer reviews</h4>

<a href="acer_liquid_x2-review-1439.php" class="module-reviews-xl-link">
  <img class="module-reviews-xl-thumb" src="https://fdn.gsmarena.com/imgroot/reviews/16/acer-liquid-x2/-347x151/gsmarena_000.jpg" alt="Acer Liquid X2 review: Switchboarding">
  <div class="module-review-xl-title">
    <span>Switchboarding</span><br>
    <strong>Acer Liquid X2 review</strong>
  </div>
</a>
<a href="acer_liquid_jade_primo-review-1419.php" class="module-reviews-xl-link">
  <img class="module-reviews-xl-thumb" src="https://fdn.gsmarena.com/imgroot/reviews/16/acer-jade-primo/-347x151/gsmarena_001.jpg" alt="Acer Liquid Jade Primo review: Windows Prime">
  <div class="module-review-xl-title">
    <span>Windows Prime</span><br>
    <strong>Acer Liquid Jade Primo review</strong>
  </div>
</a>
<a href="acer_liquid_jade_s-review-1237.php" class="module-reviews-xl-link">
  <img class="module-reviews-xl-thumb" src="https://fdn.gsmarena.com/vv/reviewsimg/acer-liquid-jade-s/thumb_.jpg" alt="Acer Liquid Jade S review: Semi-precious">
  <div class="module-review-xl-title">
    <span>Semi-precious</span><br>
    <strong>Acer Liquid Jade S review</strong>
  </div>
</a>

</div>



<script async src="https://epnt.ebay.com/static/epn-smart-tools.js"></script>
<div class="module">
	<h4 class="section-heading">Ebay offers</h4>
	<div style="height: 258px;">
<ins class="epn-placement" data-config-id="5a6b66897a00d1627cbd98da" data-keyword="Acer phone" data-category-id="3312"></ins>
	</div>
</div>

<!-- /8095840/.2_A.34911.7_gsmarena.com_tier1 -->
<div id='div-gpt-ad-300x600btfgsmarenadesktop-0'  style='height:600px; width:300px;'>
<script>
googletag.cmd.push(function() { googletag.display('div-gpt-ad-300x600btfgsmarenadesktop-0'); });
</script>
</div>

</aside>

</div><!-- id body -->
</div><!-- id outer -->




<div id="footer">
 <div class="footer-logo">
     <img src="https://fdn2.gsmarena.com/w/css/logo-gsmarena-com.gif" alt="" />
    </div>
    <div id="footmenu">
<p>
<a href="/">Home</a>
<a href="news.php3">News</a>
<a href="reviews.php3">Reviews</a>
<a href="compare.php3">Compare</a>
<a href="network-bands.php3">Coverage</a>
<a href="glossary.php3">Glossary</a>
<a href="faq.php3">FAQ</a>

<a href="rss-news-reviews.php3" class="rss-icon">RSS feed</a></li>
<a target="_blank" rel="noopener" href="https://www.facebook.com/GSMArenacom-189627474421/" class="fb-icon">Facebook</a>
<a target="_blank" rel="noopener" href="https://twitter.com/gsmarena_com" class="tw-icon">Twitter</a>

</p>
<p>
&copy; 2000-2019 <a href="team.php3">GSMArena.com</a>
<a href="https://www.gsmarena.com/switch.php3?ver=mobile&ref=MH58em0yb3dwcXpsMiomMW93bw%3D%3D">Mobile version</a>
<a target="_blank" rel="noopener" href="https://play.google.com/store/apps/details?id=com.gsmarena.android">Android app</a>
<a href="contact.php3">Contact us</a>
<a href="privacy-policy.php3">Privacy</a>
<a href="terms.php3">Terms of use</a>

</p>
<div id="cdn-hosting">
<a href="http://www.maxcdn.com/" target="_blank" rel="nofollow noopener">
  <span class="center">CDN by</span><br />
  <img src="https://cdn2.gsmarena.com/w/css/maxcdn.gif" alt="" />
</a>
</div>
  </div>
 </div>


</div>


<script type="text/javascript" src="https://fdn.gsmarena.com/vv/assets10/js/autocomplete.js?ver=18"></script>
<script type="text/javascript" language="javascript">
AUTOCOMPLETE_LIST_URL = "/quicksearch-8089.jpg";
$gsm.addEventListener(document, "DOMContentLoaded", function()
{
    new Autocomplete( "topsearch-text", "topsearch", true );
}
)
</script>


<script>
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-131096-1', 'auto' );
	ga('set', 'anonymizeIp', true);
	ga('send', 'pageview'
, { 'dimension2': '2' }
	);

</script>





<script type="text/javascript" src="https://fdn.gsmarena.com/vv/assets10/js/makers.js?v=3"></script>
</body></html>`
})

jb.component('data-resource.devices', { /* dataResource.devices */
  passiveData: [
    'acer_chromebook_tab_10-9139.php',
    'acer_iconia_talk_s-8306.php',
    'acer_liquid_z6_plus-8305.php',
    'acer_liquid_z6-8304.php',
    'acer_iconia_tab_10_a3_a40-8080.php',
    'acer_liquid_x2-8034.php',
    'acer_liquid_jade_2-7956.php',
    'acer_liquid_zest_plus-8059.php',
    'acer_liquid_zest-7955.php',
    'acer_predator_8-7750.php',
    'acer_liquid_jade_primo-7650.php',
    'acer_liquid_z330-7530.php',
    'acer_liquid_z320-7531.php',
    'acer_liquid_z630s-7529.php',
    'acer_liquid_z630-7528.php',
    'acer_liquid_z530s-7527.php',
    'acer_liquid_z530-7526.php',
    'acer_liquid_m330-7524.php',
    'acer_liquid_m320-7525.php',
    'acer_iconia_tab_10_a3_a30-7218.php',
    'acer_iconia_one_8_b1_820-7217.php',
    'acer_iconia_tab_a3_a20-7136.php',
    'acer_iconia_tab_a3_a20fhd-7135.php',
    'acer_liquid_jade_z-7072.php',
    'acer_liquid_z520-7073.php',
    'acer_liquid_z220-7074.php',
    'acer_liquid_m220-7071.php',
    'acer_liquid_z410-6912.php',
    'acer_liquid_jade_s-6864.php',
    'acer_liquid_z500-6635.php',
    'acer_liquid_x1-6419.php',
    'acer_liquid_jade-6423.php',
    'acer_liquid_e700-6420.php',
    'acer_liquid_e600-6421.php',
    'acer_liquid_z200-6422.php',
    'acer_iconia_tab_8_a1_840fhd-6424.php',
    'acer_iconia_tab_7_a1_713hd-6342.php',
    'acer_iconia_tab_7_a1_713-6343.php',
    'acer_iconia_one_7_b1_730-6341.php',
    'acer_liquid_e3_duo_plus-6680.php'
  ]
})

jb.component('html-parsing.parseDevice', { /* htmlParsing.parseDevice */
  type: 'control',
  impl: group({

  })
})

jb.component('data-resource.progress', { /* dataResource.progress */
  watchableData: {

  }
})
