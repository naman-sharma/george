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

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css">
    <link rel='stylesheet prefetch' href='http://fonts.googleapis.com/css?family=Roboto:400,100,300,500,700,900|RobotoDraft:400,100,300,500,700,900'>
    <link rel='stylesheet prefetch' href='http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css'>
    <script src = "https://cdn.jsdelivr.net/jquery.validation/1.16.0/jquery.validate.js"></script>
    <script>
        onload = function(){
            $('form').validate();
        }
    </script>

    <!-- MAKE SURE YOU ADD THE WEBSITE DOMAIN HERE -->
    <script src="https://www.gstatic.com/firebasejs/3.9.0/firebase.js"></script>
    <script>
        // Initialize Firebase
        var config = {
            apiKey: "AIzaSyCkNk3wd9Lxk3u3yHyTaUeIAoyz1OwPBKY",
            authDomain: "george-7ac08.firebaseapp.com",
            databaseURL: "https://george-7ac08.firebaseio.com",
            projectId: "george-7ac08",
            storageBucket: "george-7ac08.appspot.com",
            messagingSenderId: "935265598704"
        };
        firebase.initializeApp(config);
    </script>

    <script src="js/firebaseui.js"></script>
    <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/1.0.1/firebaseui.css" />
    <script type="text/javascript">
        // FirebaseUI config.
        var uiConfig = {
            signInSuccessUrl: 'index.php',
            signInOptions: [
                // Leave the lines as is for the providers you want to offer your users.
                /*firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                firebase.auth.GithubAuthProvider.PROVIDER_ID, */
                firebase.auth.EmailAuthProvider.PROVIDER_ID
            ],
            // Terms of service url.
            tosUrl: '<your-tos-url>'
        };

        // Initialize the FirebaseUI Widget using Firebase.
        var ui = new firebaseui.auth.AuthUI(firebase.auth());
        // The start method will wait until the DOM is loaded.
        ui.start('#firebaseui-auth-container', uiConfig);
    </script>
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
<div style="height: 100px;"></div>
<div id="firebaseui-auth-container"></div>


<script src='http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>

<script src="js/index.js"></script>
</section>



</body>
</html>