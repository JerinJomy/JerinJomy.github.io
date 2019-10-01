// goog-signin-page.js
// ------------------------------------------------------------------
/* jshint esversion: 9, node: false */
/* global console, Buffer, window, gapi, atob */

(function (){
  'use strict';
  const jwtRe = new RegExp('^([^\\.]+)\\.([^\\.]+)\\.([^\\.]+)$');

  function renderIdToken(token) {
    let matches = jwtRe.exec(token);
    if (matches && matches.length == 4) {
      // colorize the base64-encoded blobs
      let html = oneDiv("ID Token",
                    token.replace(jwtRe, '<span class="jwt-header">$1</span>.<span class="jwt-payload">$2</span>.<span class="jwt-signature">$3</span>'));

      let styles = ['header','payload'];
      matches.slice(1,-1).forEach((item,index) => {
        let json = atob(item),
            obj = JSON.parse(json);
        html += oneDiv(styles[index], '<pre class="jwt-'+ styles[index] +'">' +
                       JSON.stringify(obj,null,2) +
                       '</pre>');
      });
      return html;
    }
    return oneDiv("ID Token", token);
  }

  function g() {
    return gapi.auth2.getAuthInstance();
  }

  function oneDiv(label, value) {
    let isToken = label.match(/token/i),
        valueClasses = ['value'];
    if (isToken) {
      valueClasses.push('token');
    }
    return '<div class="item">'+
      '  <div class="label">'+ label +'</div>' +
      '  <div class="'+ valueClasses.join(' ') + '">' + value + '</div>'+
      '</div>';
  }

  function signOut() {
    g().signOut().then( _ => {
      let elt = document.getElementById('output');
      elt.innerHTML = '';
      console.log('User signed out.');
      showSignout(false);
    });
  }

  function onSignIn(googleUser) {
    let elt = document.getElementById("output"),
        profile = googleUser.getBasicProfile(),
        html = oneDiv('ID',  profile.getId()) +
      oneDiv('Full Name', profile.getName()) +
      //oneDiv('Given Name',  profile.getGivenName()) +
      //oneDiv('Family Name', profile.getFamilyName()) +
      oneDiv("Email", profile.getEmail()) +
      oneDiv('Image', '<img src="' + profile.getImageUrl() + '">');

    // The ID token you need to pass to your backend:
    let id_token = googleUser.getAuthResponse().id_token;
    //html += oneDiv("ID Token", id_token);
    html += renderIdToken(id_token);
    elt.innerHTML = html;
    showSignout(true);
  }

  function showSignout(visible) {
    let signout = document.getElementById('signout');
    if (signout) {
      signout.classList.add(visible?'visible':'hidden');
      signout.classList.remove(visible?'hidden':'visible');
    }
  }

  function gapiPostInit() {
    gapi.load('auth2', _ => {
      // Ready.
      if (g().isSignedIn.get()) {
        showSignout(true);
      }
      else {
        showSignout(false);
      }
    });
  }

  window.onSignIn = onSignIn;
  window.signOut = signOut;
  window.gapiPostInit = gapiPostInit;

}());