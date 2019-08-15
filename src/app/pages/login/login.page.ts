import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { ApiService } from '../../services/api.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage'; 
import { AuthService } from '../../services/auth.service'; 


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string;
  password: string;
  loading: any;
  loginForm: FormGroup;

  constructor( 
    private alertController   : AlertController,
    private apiService        : ApiService,
    private facebook          : Facebook,
    private googlePlus        : GooglePlus,
    private loadingController : LoadingController,
    private navController     : NavController,  
    private platform          : Platform, 
    private formBuilder       : FormBuilder,
    private storage           : Storage,
    private authService       : AuthService
  ) {   
  }

  ngOnInit() {
      
  }

  ionViewWillEnter() {
    //this.setTextboxesToEmpty();
  }

  async presentAlert(options) {
    const alert = await this.alertController.create({ 
      header : options.header,
      message: options.message,
      buttons: ['OK']
    });

    await alert.present();
  }  

  async displayPage(name) {
    await this.navController.navigateForward('/' + name);
  }
 
  async presentLoading(message) {
    let options = {
      message: message
    }

    this.loading = await this.loadingController.create(options);

    await this.loading.present();  
  }  

  async dismissLoading() { 
    await this.loading.dismiss(); 
  } 

  setTextboxesToEmpty(): void {
    this.email    = '';
    this.password = '';
  }

  loginWithFacebook(): void {

    this.authService.getFbUserAuth().then(response => {

      this.presentLoading('Logging in to your account.').then(() => { 
        response.loginType = 'facebook'; 

        this.apiService.getTiriponUserAccount(response).then(user => {  
          if (this.doesUserExists(user)) {  
            this.storage.set('hasLoggedIn', true).then(() => {
              this.storage.set('loginType', 'facebook').then(() => {
                this.storage.set('user', user[0]).then(() => {
                  this.dismissLoading().then(() => {
                    this.navController.navigateForward('/home');
                  }) 
                }); 
              }) 
            });
          } else {
            const options = {
              header: 'Facebook Login',
              message: 'We could not find a <strong>Tiripon account</strong> associated with this Facebook ' +
              'login. Please register an account.'
            }
                
            this.presentAlert(options).then(() => {
              this.setTextboxesToEmpty();
            });
          }

          this.dismissLoading();
   
              // this.logoutFacebookAccount();
        }); 

        this.dismissLoading();
      })
      
    });

 
  } 

  loginWithGoogle(): void {  
      this.authService.getGoogleUserAuth().then(authUser => {  
          //alert(authUser);
          this.presentLoading('Logging into your account').then(() => {

            this.apiService.getTiriponUserAccount(authUser).then(user => { 

              if (this.doesUserExists(user)) { 
                
                this.storage.set('hasLoggedIn', true).then(() => {
                  this.storage.set('loginType', 'google').then(() => {
                    this.storage.set('user', user[0]).then(() => {
                      this.dismissLoading().then(() => {
                        this.navController.navigateForward('/home');
                      }) 
                    }); 
                  }) 
                });
                            
              } else {

                const options = {
                    header: 'Google Login',
                    message: 'We could not find a <strong>Tiripon account</strong> associated with this Google ' +
                   'login. Please register an account.'
                };

                this.dismissLoading().then(() => {
                  this.presentAlert(options).then(() => {
                    this.setTextboxesToEmpty();
                  }); 
                })
                 
              }
     
            }); 

          }); 

        }).catch(error => {
          if (this.hasBeenCancelled(error)) {
            //
          } else {
            alert(JSON.stringify(error));
          }
        });

  }  

  hasBeenCancelled(error): boolean {
    if (error === 12501) {
      return true;
    } else {
      return false;
    } 
  }

  setLoggedInUserStorage(): void {

  }

  logoutWithGoogle(): void {
    this.authService.logoutGoogleUserAuth().then(hasBeenLoggedOut => {
      if (hasBeenLoggedOut) { 
        this.navController.navigateForward('/home');
      } 
    });
  }

  emailIsRequiredText: string;

  hasNoInputs() {
    if (this.email === '' || this.password === '') {
      return true; 
    }  
  }

  login() {
    let isEmailEmpty = this.email === '';
    let isPasswordEmpty = this.password === '';

    /*if (isEmailEmpty) {
      //alert(1); 
      return;
    } */
    const credentials = {
      email: this.email,
      password: this.password,
      loginType: 'normal'
    };
    this.presentLoading('Logging into your account...');
    // const credentials = {
    //   email: 'salesletter123@gmail.com',
    //   password: 'Salesletter123Salesletter123'
    // }

    this.apiService.getTiriponUserAccount(credentials).then(user => { 
      if (this.doesUserExists(user)) {  
                this.storage.set('hasLoggedIn', true).then(() => {
                  this.storage.set('loginType', 'normal').then(() => {
                    this.storage.set('user', user[0]).then(() => {
                      this.dismissLoading().then(() => {
                        this.navController.navigateForward('/home');
                      }) 
                    }); 
                  }) 
                });  
      } else {
        this.dismissLoading().then(() => {
          const options = {
            header: 'Login',
            message: 'Incorrect username and password.'
          } 
          this.presentAlert(options).then(() => {
            this.setTextboxesToEmpty();
          }); 
        });
      } 

    })

  } 

  functionName () {
    alert(1);
  } 

  doesUserExists(user) {
    if (user.length === 1) {
      return true;
    } else {
      return false;
    }
  } 
}