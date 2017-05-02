<!DOCTYPE HTML>

<html>
<head>
    <title></title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <meta name="description" content="" />
    <meta name="keywords" content="" />
    <!--[if lte IE 8]><script src="js/html5shiv.js"></script><![endif]-->
    <script src="js/jquery.min.js"></script>
    <script src="js/skel.min.js"></script>
    <script src="js/skel-layers.min.js"></script>
    <script src="js/init.js"></script>
    <script src="js/jssor.slider-23.1.1.min.js" type="text/javascript"></script>
    <script type="text/javascript">
        jssor_1_slider_init = function() {

            var jssor_1_options = {
                $AutoPlay: 1,
                $AutoPlaySteps: 1,
                $SlideDuration: 160,
                $SlideWidth: 800,
                $SlideSpacing: 3,
                $Cols: 0,
                $ArrowNavigatorOptions: {
                    $Class: $JssorArrowNavigator$,
                    $Steps: 4
                },
                $BulletNavigatorOptions: {
                    $Class: $JssorBulletNavigator$,
                    $SpacingX: 1,
                    $SpacingY: 1
                }
            };

            var jssor_1_slider = new $JssorSlider$("jssor_1", jssor_1_options);

            /*responsive code begin*/
            /*remove responsive code if you don't want the slider scales while window resizing*/
            function ScaleSlider() {
                var refSize = jssor_1_slider.$Elmt.parentNode.clientWidth;
                if (refSize) {
                    refSize = Math.min(refSize, 809);
                    jssor_1_slider.$ScaleWidth(refSize);
                }
                else {
                    window.setTimeout(ScaleSlider, 30);
                }
            }
            ScaleSlider();
            $Jssor$.$AddEvent(window, "load", ScaleSlider);
            $Jssor$.$AddEvent(window, "resize", ScaleSlider);
            $Jssor$.$AddEvent(window, "orientationchange", ScaleSlider);
            /*responsive code end*/
        };
    </script>
    <noscript>
        <link rel="stylesheet" href="css/skel.css" />
        <link rel="stylesheet" href="css/style.css" />
        <link rel="stylesheet" href="css/style-xlarge.css" />
    </noscript>
    <style>
        /* jssor slider bullet navigator skin 03 css */
        /*
        .jssorb03 div           (normal)
        .jssorb03 div:hover     (normal mouseover)
        .jssorb03 .av           (active)
        .jssorb03 .av:hover     (active mouseover)
        .jssorb03 .dn           (mousedown)
        */
        .jssorb03 {
            position: absolute;
        }
        .jssorb03 div, .jssorb03 div:hover, .jssorb03 .av {
            position: absolute;
            /* size of bullet elment */
            width: 21px;
            height: 21px;
            text-align: center;
            line-height: 21px;
            color: white;
            font-size: 12px;
            overflow: hidden;
            cursor: pointer;
        }
        .jssorb03 div { background-position: -5px -4px; }
        .jssorb03 div:hover, .jssorb03 .av:hover { background-position: -35px -4px; }
        .jssorb03 .av { background-position: -65px -4px; }
        .jssorb03 .dn, .jssorb03 .dn:hover { background-position: -95px -4px; }

        /* jssor slider arrow navigator skin 03 css */
        /*
        .jssora03l                  (normal)
        .jssora03r                  (normal)
        .jssora03l:hover            (normal mouseover)
        .jssora03r:hover            (normal mouseover)
        .jssora03l.jssora03ldn      (mousedown)
        .jssora03r.jssora03rdn      (mousedown)
        .jssora03l.jssora03ldn      (disabled)
        .jssora03r.jssora03rdn      (disabled)
        */
        .jssora03l, .jssora03r {
            display: block;
            position: absolute;
            /* size of arrow element */
            width: 55px;
            height: 55px;
            cursor: pointer;

            overflow: hidden;
        }
        .jssora03l { background-position: -3px -33px; }
        .jssora03r { background-position: -63px -33px; }
        .jssora03l:hover { background-position: -123px -33px; }
        .jssora03r:hover { background-position: -183px -33px; }
        .jssora03l.jssora03ldn { background-position: -243px -33px; }
        .jssora03r.jssora03rdn { background-position: -303px -33px; }
        .jssora03l.jssora03lds { background-position: -3px -33px; opacity: .3; pointer-events: none; }
        .jssora03r.jssora03rds { background-position: -63px -33px; opacity: .3; pointer-events: none; }
        a {
            text-decoration: none;
            display: inline-block;
            padding: 8px 16px;
        }

        a:hover {
            background-color: #ddd;
            color: black;
        }

        .previous {
            background-color: #16a6ff;
            color: white;
        }

        .next {
            background-color: #16a6ff;
            color: white;
        }

        .round {
            border-radius: 50%;
        }

        .modalDialog {
            position: fixed;
            font-family: Arial, Helvetica, sans-serif;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background: rgba(0,0,0,0.8);
            z-index: 99999;
            opacity:0;
            -webkit-transition: opacity 400ms ease-in;
            -moz-transition: opacity 400ms ease-in;
            transition: opacity 400ms ease-in;
            pointer-events: none;
        }

        .modalDialog:target {
            opacity:1;
            pointer-events: auto;
        }

        .modalDialog > div {
            width: 800px;
            position: relative;
            margin: 10% auto;
            padding: 5px 20px 13px 20px;
            border-radius: 10px;
            background: #fff;
            background: -moz-linear-gradient(#fff, #999);
            background: -webkit-linear-gradient(#fff, #999);
            background: -o-linear-gradient(#fff, #999);
        }

        .close {
            background: #606061;
            color: #FFFFFF;
            line-height: 25px;
            position: absolute;
            right: -12px;
            text-align: center;
            top: -10px;
            width: 24px;
            text-decoration: none;
            font-weight: bold;
            -webkit-border-radius: 12px;
            -moz-border-radius: 12px;
            border-radius: 12px;
            -moz-box-shadow: 1px 1px 3px #000;
            -webkit-box-shadow: 1px 1px 3px #000;
            box-shadow: 1px 1px 3px #000;
        }

        .close:hover { background: #00d9ff; }
    </style>
</head>
<body id="top">
<!-- Header -->
<header id="header" class="skel-layers-fixed">
    <h1><a href="index.php">George</a></h1>
    <nav id="nav">
        <ul>
            <li><a href="#">Advertisers</a></li>
            <li><a href="#">About Us</a></li>
            <li><a href="login.php">Login</a></li>
            <li><a href="login.php" class="button special">Register</a></li>
        </ul>
    </nav>
</header>

<!-- Banner -->
<section id="banner2" style="padding-top:20px">
    <div id="jssor_1" style="position:relative;margin:0 auto;top:0px;left:0px;width:809px;height:150px;overflow:hidden;visibility:hidden;">
        <div data-u="slides" style="cursor:default;position:relative;top:0px;left:0px;width:100%;height:150px;overflow:hidden;">
            <div>
                <img data-u="image" src="images/banner1.jpg" />
            </div>
            <div>
                <img data-u="image" src="images/banner2.jpg" />
            </div>
            <div>
                <img data-u="image" src="images/banner3.jpg" />
            </div>

        </div>
        <!-- Bullet Navigator -->
        <div data-u="navigator" class="jssorb03" style="bottom:10px;right:10px;">
            <!-- bullet navigator item prototype -->
            <div data-u="prototype" style="width:0px;height:0px;">
                <!--  <div data-u="numbertemplate"></div> -->
            </div>
        </div>
        <!-- Arrow Navigator -->
        <!-- <span data-u="arrowleft" class="jssora03l" style="top:0px;left:8px;width:55px;height:55px;" data-autocenter="2"></span>
        <span data-u="arrowright" class="jssora03r" style="top:0px;right:8px;width:55px;height:55px;" data-autocenter="2"></span>
     --></div>



    <script type="text/javascript">jssor_1_slider_init();</script>
</section>
<div id = prevNext style="padding-top:50px">
    <a href="#" class="previous">&laquo; Previous</a>
    <a style= "float:right;" href="#" class="next">Next &raquo;</a>
</div>

<!-- One -->
<section id="three" class="wrapper style1">
    <div class="container">
        <div class="row">
            <div class="5u">
                <section>
                    <a href="#openModal1"><img src="images/blender.jpg" width="500px" height="500px" alt="" /></a>

                    <div id="openModal1" class="modalDialog">
                        <div>
                            <a href="#close" title="Close" class="close">X</a>
                            <a href="#openModal1"><img src="images/blender.jpg" width="500px" height="500px" alt="" /></a>
                        </div>
                    </div>

                </section>
            </div>
            <div class="7u">
                <section>
                    <h2>Contact Info: james.bond@gmail.com</h2>
                    <h2>Price For Model : $35</h2>
                </section>
                <hr />
                <section>
                    <h3>More Pictures:</h3>
                    <ul class="alt">
                        <li>
                            <a href="#openModal2"><img src="images/blender2.jpg" width="50px" height="50px" alt="" /></a>

                            <div id="openModal2" class="modalDialog">
                                <div>
                                    <a href="#close" title="Close" class="close">X</a>
                                    <img src="images/blender2.jpg" width="500px" height="500px" alt="" />
                                </div>
                            </div>

                            <a href="#openModal3"><img src="images/blender3.jpg" width="50px" height="50px" alt="" /></a>

                            <div id="openModal3" class="modalDialog">
                                <div>
                                    <a href="#close" title="Close" class="close">X</a>
                                    <img src="images/blender3.jpg" width="500px" height="500px" alt="" />
                                </div>
                            </div>

                            <a href="#openModal4"><img src="images/blender4.jpg" width="50px" height="50px" alt="" /></a>

                            <div id="openModal4" class="modalDialog">
                                <div>
                                    <a href="#close" title="Close" class="close">X</a>
                                    <img src="images/blender4.jpg" width="500px" height="500px" alt="" />
                                </div>
                            </div>

                            <a href="#openModal5"><img src="images/blender5.jpg" width="50px" height="50px" alt="" /></a>

                            <div id="openModal5" class="modalDialog">
                                <div>
                                    <a href="#close" title="Close" class="close">X</a>
                                    <img src="images/blender5.jpg" width="500px" height="500px" alt="" />
                                </div>
                            </div>

                            <a href="#openModal6"><img src="images/blender6.jpg" width="50px" height="50px" alt="" /></a>

                            <div id="openModal6" class="modalDialog">
                                <div>
                                    <a href="#close" title="Close" class="close">X</a>
                                    <img src="images/blender6.jpg" width="500px" height="500px" alt="" />
                                </div>
                            </div>

                            <a href="#openModal7"><img src="images/blender7.jpg" width="50px" height="50px" alt="" /></a>

                            <div id="openModal7" class="modalDialog">
                                <div>
                                    <a href="#close" title="Close" class="close">X</a>
                                    <img src="images/blender7.jpg" width="500px" height="500px" alt="" />
                                </div>
                            </div>

                            <a href="#openModal8"><img src="images/blender8.jpg" width="50px" height="50px" alt="" /></a>

                            <div id="openModal8" class="modalDialog">
                                <div>
                                    <a href="#close" title="Close" class="close">X</a>
                                    <img src="images/blender8.jpg" width="500px" height="500px" alt="" />
                                </div>
                            </div>

                        </li>
                        <li>
                            <a href="#openModal10"><img src="images/blender10.jpg" width="50px" height="50px" alt="" /></a>

                            <div id="openModal10" class="modalDialog">
                                <div>
                                    <a href="#close" title="Close" class="close">X</a>
                                    <img src="images/blender10.jpg" width="500px" height="500px" alt="" />
                                </div>
                            </div>

                            <a href="#openModal11"><img src="images/blender11.jpg" width="50px" height="50px" alt="" /></a>

                            <div id="openModal11" class="modalDialog">
                                <div>
                                    <a href="#close" title="Close" class="close">X</a>
                                    <img src="images/blender11.jpg" width="500px" height="500px" alt="" />
                                </div>
                            </div>

                            <a href="#openModal12"><img src="images/blender12.jpg" width="50px" height="50px" alt="" /></a>

                            <div id="openModal12" class="modalDialog">
                                <div>
                                    <a href="#close" title="Close" class="close">X</a>
                                    <img src="images/blender12.jpg" width="500px" height="500px" alt="" />
                                </div>
                            </div>

                            <a href="#openModal13"><img src="images/blender13.jpg" width="50px" height="50px" alt="" /></a>

                            <div id="openModal13" class="modalDialog">
                                <div>
                                    <a href="#close" title="Close" class="close">X</a>
                                    <img src="images/blender13.jpg" width="500px" height="500px" alt="" />
                                </div>
                            </div>

                            <a href="#openModal14"><img src="images/blender14.jpg" width="50px" height="50px" alt="" /></a>

                            <div id="openModal14" class="modalDialog">
                                <div>
                                    <a href="#close" title="Close" class="close">X</a>
                                    <img src="images/blender14.jpg" width="500px" height="500px" alt="" />
                                </div>
                            </div>

                            <a href="#openModal15"><img src="images/blender15.jpg" width="50px" height="50px" alt="" /></a>

                            <div id="openModal15" class="modalDialog">
                                <div>
                                    <a href="#close" title="Close" class="close">X</a>
                                    <img src="images/blender15.jpg" width="500px" height="500px" alt="" />
                                </div>
                            </div>

                            <a href="#openModal16"><img src="images/blender16.jpg" width="50px" height="50px" alt="" /></a>

                            <div id="openModal16" class="modalDialog">
                                <div>
                                    <a href="#close" title="Close" class="close">X</a>
                                    <img src="images/blender16.jpg" width="500px" height="500px" alt="" />
                                </div>
                            </div>
                        </li>

                    </ul>
                </section>
            </div>
        </div>
    </div>
</section>

<!-- Two -->
<section id="two" class="wrapper style2">
    <header class="major">
        <h2>Description Of Model</h2>
        <p>Vitamix Blender</p>
    </header>
    <div class="container">
        <div class="row">
            <div class="6u">
                <section class="special">
                    <a class="image fit"><img src="images/blender3.jpg" width="300px" height="400px" alt="" /></a>
                    <h3>More than just a blender</h3>
                    <p>Vitamix makes blenders that can do the work of multiple kitchen appliances. Whether youre looking to experiment with new techniques or make your favorite smoothie, this is for you!</p>
                </section>
            </div>
            <div class="6u">
                <section class="special">
                    <a class="image fit"><img src="images/blender4.jpg" width="400px" height="400px" alt="" /></a>
                    <h3>Endless Possibilities</h3>
                    <p>Be creative with your smoothies, and make a work of art everyday in the comfort of your own home.</p>

                </section>
            </div>
        </div>
    </div>
</section>

<!-- Three -->

<section id="one" class="wrapper style1">
    <header class="major">
        <h2>Comments from Posters</h2>
        <p>What People Have To Say About This Product</p>
    </header>
    <div class="container">
        <div class="row">
            <div class="4u">
                <section class="special box">
                    <i class="" src="images/face1.jpg"></i>
                    <h3>Bob Smith says..</h3>
                    <p>I have one of these at home and would recommend it to any buyer.</p>
                </section>
            </div>
            <div class="4u">
                <section class="special box">
                    <h3>Angela Watson says..</h3>
                    <p>What is the retail price for this?<br> Asking for a friend.</p>
                </section>
            </div>
            <div class="4u">
                <section class="special box">
                    <h3>Micheal Sam says..</h3>
                    <p>Wow! Interesting listing. I am definitely interested.</p>
                </section>
            </div>
        </div>
    </div>
</section>
<div id = prevNext2 style="padding-top:50px">
    <a href="#" class="previous">&laquo; Previous</a>
    <a style= "float:right;" href="#" class="next">Next &raquo;</a>
</div>

<!-- Footer -->
<footer id="footer">
    <ul class="copyright">
        <li>&copy; Copyright 2017</li>
    </ul>
</footer>

</body>
</html>