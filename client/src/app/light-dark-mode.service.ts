import {Injectable} from '@angular/core';
import {CookieService} from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class LightDarkModeService {
  private readonly lightModeCookie = "light_mode";
  private isLightMode = true;

  constructor(private cookieService: CookieService) {
    if (this.cookieService.check(this.lightModeCookie)) {
      this.isLightMode = this.cookieService.get(this.lightModeCookie) === String(true);
    }
  }

  public apply() {
    if (this.isLightMode) {
      document.getElementById("body").classList.add("lightTheme");
    } else {
      document.getElementById("body").classList.remove("lightTheme");
    }
  }

  public set(lightMode: boolean) {
    this.isLightMode = lightMode;
    this.cookieService.set(this.lightModeCookie, String(this.isLightMode), {path: "/", expires: 30});
    this.apply();
  }

  public get(): boolean {
    return this.isLightMode;
  }
}
