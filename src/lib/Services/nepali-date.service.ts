// src/lib/services/nepali-date.service.ts
import { Injectable } from '@angular/core';

// Declare global variables
declare global {
  interface Window {
    NepaliFunctions: any;
    bs2ad: any;
    ad2bs: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class NepaliDateService {
  public assetsLoaded = false;
  public loadingPromise: Promise<void> | null = null;
  private isScriptLoaded = false;
  private isCssLoaded = false;

  constructor() {
    // Initialize on service creation
    this.initializeService();
  }

  public initializeService(): void {
    if (!this.loadingPromise) {
      this.loadingPromise = this.loadAssets();
    }
  }

  public async loadAssets(): Promise<void> {
    if (this.assetsLoaded) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Load CSS first
        this.loadNepaliDatePickerCSS();
        
        // Load the complete JavaScript functionality
        this.loadNepaliDatePickerJS().then(() => {
          // Wait for the script to be fully executed
          this.waitForGlobalFunctions().then(() => {
            this.assetsLoaded = true;
            resolve();
          }).catch((error) => {
            console.error('Error waiting for global functions:', error);
            reject(error);
          });
        }).catch((error) => {
          console.error('Error loading JS:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Error loading Nepali date assets:', error);
        reject(error);
      }
    });
  }

  private async waitForGlobalFunctions(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      
      const checkFunctions = () => {
        if (window.NepaliFunctions && window.bs2ad && window.ad2bs) {
          resolve();
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkFunctions, 100);
        } else {
          reject(new Error('Global functions not available after timeout'));
        }
      };
      
      checkFunctions();
    });
  }

  public loadNepaliDatePickerCSS(): void {
    // Check if CSS is already loaded
    if (document.getElementById('nepali-date-picker-css') || this.isCssLoaded) {
      this.isCssLoaded = true;
      return;
    }

    const style = document.createElement('style');
    style.id = 'nepali-date-picker-css';
    style.textContent = `
      .ndc-chevron::before{border-style:solid;border-width:.25em .25em 0 0;content:"";display:inline-block;height:.3em;left:.15em;position:relative;top:5px;transform:rotate(-45deg);vertical-align:top;width:.3em;border-color:#fff;box-sizing:initial}
      .ndc-chevron.ndc-right:before{left:-1px;transform:rotate(45deg)}
      .ndc-chevron.ndc-left:before{left:1px;transform:rotate(-135deg)}
      
      div#ndp-nepali-box{
        font-family:"Trebuchet MS",Tahoma,Verdana,Arial,sans-serif;
        border:1px solid #a6c9e2;
        background-color:#fdfefe;
        position:absolute;
        top:-999px;
        z-index:9999;
        padding:1px;
        box-shadow:0 5px 5px -3px rgba(0,0,0,.2),0 8px 10px 1px rgba(0,0,0,.14),0 3px 14px 2px rgba(0,0,0,.12);
        margin-left:-100px;
      }
      
      div#ndp-nepali-box .hidden{display:none}
      div#ndp-table-div{margin:0}
      div#ndp-table-div table{border-spacing:2px;border-collapse:separate}
      div#ndp-nepali-box td.ndp-date{padding:2px;border:1px solid #c5dbec;background:#dfeffc;color:#2e6e9e}
      div#ndp-nepali-box td.ndp-selected{border:1px solid #fad42e;background:#fbec88;color:#363636;text-align:center}
      div#ndp-nepali-box td.ndp-current{padding:2px;border:1px solid #fed22f;background:#f5f8f9;text-align:center;font-weight:700}
      div#ndp-nepali-box td.ndp-current a{color:#e17009;display:block}
      div#ndp-nepali-box td.ndp-date a,div#ndp-nepali-box td.ndp-selected a{display:block;color:#1c94c4;text-decoration:none;width:20px;text-align:center;font-weight:700}
      
      a.ndp-disabled{color:#ccc!important}
      div#ndp-nepali-box td.ndp-current:hover,div#ndp-nepali-box td.ndp-date:hover{border:1px solid #fed22f;opacity:.8}
      div#ndp-nepali-box td.ndp-date a:hover{color:#1c94c4}
      div#ndp-nepali-box table,div#ndp-nepali-box td,div#ndp-nepali-box tr{font-size:12px;height:19px;line-height:19px;border-collapse:separate;border-spacing:2px}
      div#ndp-nepali-box a{text-decoration:none}
      
      .ndp-days th,.ndp-header{text-align:center;font-weight:700}
      .ndp-header{border:1px solid #4297d7;background:#87b6d9;color:#fff;font-size:12px;padding:2px;line-height:20px;margin:2px}
      .ndp-next:hover,.ndp-prev:hover{background:#fed22f}
      .ndp-next,.ndp-prev{position:absolute;top:8px;width:1.3em;height:1.3em;background:#247ac4;border-radius:50%}
      .ndp-next.ndp-disabled,.ndp-prev.ndp-disabled{background:#ccc}
      .ndp-prev{left:7px}
      .ndp-next{right:7px}
      
      #currentMonth #ndp-month-select,#currentMonth #ndp-year-select{color:#000;font-size:12px;font-weight:400;padding:2px 1px 0;height:22px}
      
      .ndp-corner-all,.ndp-corner-left,.ndp-corner-tl,.ndp-corner-top{-moz-border-radius-topleft:5px;-webkit-border-top-left-radius:5px;-khtml-border-top-left-radius:5px;border-top-left-radius:5px}
      .ndp-corner-all,.ndp-corner-right,.ndp-corner-top,.ndp-corner-tr{-moz-border-radius-topright:5px;-webkit-border-top-right-radius:5px;-khtml-border-top-right-radius:5px;border-top-right-radius:5px}
      .ndp-corner-all,.ndp-corner-bl,.ndp-corner-bottom,.ndp-corner-left{-moz-border-radius-bottomleft:5px;-webkit-border-bottom-left-radius:5px;-khtml-border-bottom-left-radius:5px;border-bottom-left-radius:5px}
      .ndp-corner-all,.ndp-corner-bottom,.ndp-corner-br,.ndp-corner-right{-moz-border-radius-bottomright:5px;-webkit-border-bottom-right-radius:5px;-khtml-border-bottom-right-radius:5px;border-bottom-right-right-radius:5px}

      /* Custom styles for Angular integration */
      .nepali-date-container {
        position: relative;
        display: inline-block;
        width: 100%;
      }
      
      .nepali-date-input {
        width: 100%;
      }
      
      .nepali-calendar-icon {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        color: #6c757d;
        font-size: 12px;
      }
      
      .nepali-calendar-icon:hover {
        color: #495057;
      }
    `;
    document.head.appendChild(style);
    this.isCssLoaded = true;
  }

  public async loadNepaliDatePickerJS(): Promise<void> {
    // Check if JS is already loaded
    if (this.isScriptLoaded || (window.NepaliFunctions && window.bs2ad && window.ad2bs)) {
      this.isScriptLoaded = true;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Remove any existing script to avoid conflicts
      const existingScript = document.getElementById('nepali-date-picker-js');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.id = 'nepali-date-picker-js';
      script.type = 'text/javascript';

      // Set script content
      script.textContent = `
        (function() {
          "use strict";
          
          var NepaliFunctions=function(){"use strict";
            var e=["MM-DD-YYYY","MM/DD/YYYY","YYYY-MM-DD","YYYY/MM/DD","DD-MM-YYYY","DD/MM/YYYY"],
                t="==",n="<",r="<=",a=">",i=">=",o="AD",u="YYYY-MM-DD",d="MM/DD/YYYY";
            
            function l(){
              var e=[],t={year:2e3,month:9,day:17},n={year:1944,month:1,day:1};
              e[1970]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[1971]=[31,31,32,31,32,30,30,29,30,29,30,30];
              e[1972]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[1973]=[30,32,31,32,31,30,30,30,29,30,29,31];
              e[1974]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[1975]=[31,31,32,32,31,30,30,29,30,29,30,30];
              e[1976]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[1977]=[30,32,31,32,31,31,29,30,29,30,29,31];
              e[1978]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[1979]=[31,31,32,32,31,30,30,29,30,29,30,30];
              e[1980]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[1981]=[31,31,31,32,31,31,29,30,30,29,30,30];
              e[1982]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[1983]=[31,31,32,32,31,30,30,29,30,29,30,30];
              e[1984]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[1985]=[31,31,31,32,31,31,29,30,30,29,30,30];
              e[1986]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[1987]=[31,32,31,32,31,30,30,29,30,29,30,30];
              e[1988]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[1989]=[31,31,31,32,31,31,30,29,30,29,30,30];
              e[1990]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[1991]=[31,32,31,32,31,30,30,30,29,29,30,30];
              e[1992]=[31,32,31,32,31,30,30,30,29,30,29,31];
              e[1993]=[31,31,31,32,31,31,30,29,30,29,30,30];
              e[1994]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[1995]=[31,32,31,32,31,30,30,30,29,29,30,30];
              e[1996]=[31,32,31,32,31,30,30,30,29,30,29,31];
              e[1997]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[1998]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[1999]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2e3]=[30,32,31,32,31,30,30,30,29,30,29,31];
              e[2001]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2002]=[31,31,32,32,31,30,30,29,30,29,30,30];
              e[2003]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2004]=[30,32,31,32,31,30,30,30,29,30,29,31];
              e[2005]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2006]=[31,31,32,32,31,30,30,29,30,29,30,30];
              e[2007]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2008]=[31,31,31,32,31,31,29,30,30,29,29,31];
              e[2009]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2010]=[31,31,32,32,31,30,30,29,30,29,30,30];
              e[2011]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2012]=[31,31,31,32,31,31,29,30,30,29,30,30];
              e[2013]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2014]=[31,31,32,32,31,30,30,29,30,29,30,30];
              e[2015]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2016]=[31,31,31,32,31,31,29,30,30,29,30,30];
              e[2017]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2018]=[31,32,31,32,31,30,30,29,30,29,30,30];
              e[2019]=[31,32,31,32,31,30,30,30,29,30,29,31];
              e[2020]=[31,31,31,32,31,31,30,29,30,29,30,30];
              e[2021]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2022]=[31,32,31,32,31,30,30,30,29,29,30,30];
              e[2023]=[31,32,31,32,31,30,30,30,29,30,29,31];
              e[2024]=[31,31,31,32,31,31,30,29,30,29,30,30];
              e[2025]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2026]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2027]=[30,32,31,32,31,30,30,30,29,30,29,31];
              e[2028]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2029]=[31,31,32,31,32,30,30,29,30,29,30,30];
              e[2030]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2031]=[30,32,31,32,31,30,30,30,29,30,29,31];
              e[2032]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2033]=[31,31,32,32,31,30,30,29,30,29,30,30];
              e[2034]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2035]=[30,32,31,32,31,31,29,30,30,29,29,31];
              e[2036]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2037]=[31,31,32,32,31,30,30,29,30,29,30,30];
              e[2038]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2039]=[31,31,31,32,31,31,29,30,30,29,30,30];
              e[2040]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2041]=[31,31,32,32,31,30,30,29,30,29,30,30];
              e[2042]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2043]=[31,31,31,32,31,31,29,30,30,29,30,30];
              e[2044]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2045]=[31,32,31,32,31,30,30,29,30,29,30,30];
              e[2046]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2047]=[31,31,31,32,31,31,30,29,30,29,30,30];
              e[2048]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2049]=[31,32,31,32,31,30,30,30,29,29,30,30];
              e[2050]=[31,32,31,32,31,30,30,30,29,30,29,31];
              e[2051]=[31,31,31,32,31,31,30,29,30,29,30,30];
              e[2052]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2053]=[31,32,31,32,31,30,30,30,29,29,30,30];
              e[2054]=[31,32,31,32,31,30,30,30,29,30,29,31];
              e[2055]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2056]=[31,31,32,31,32,30,30,29,30,29,30,30];
              e[2057]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2058]=[30,32,31,32,31,30,30,30,29,30,29,31];
              e[2059]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2060]=[31,31,32,32,31,30,30,29,30,29,30,30];
              e[2061]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2062]=[30,32,31,32,31,31,29,30,29,30,29,31];
              e[2063]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2064]=[31,31,32,32,31,30,30,29,30,29,30,30];
              e[2065]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2066]=[31,31,31,32,31,31,29,30,30,29,29,31];
              e[2067]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2068]=[31,31,32,32,31,30,30,29,30,29,30,30];
              e[2069]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2070]=[31,31,31,32,31,31,29,30,30,29,30,30];
              e[2071]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2072]=[31,32,31,32,31,30,30,29,30,29,30,30];
              e[2073]=[31,32,31,32,31,30,30,30,29,29,30,31];
              e[2074]=[31,31,31,32,31,31,30,29,30,29,30,30];
              e[2075]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2076]=[31,32,31,32,31,30,30,30,29,29,30,30];
              e[2077]=[31,32,31,32,31,30,30,30,29,30,29,31];
              e[2078]=[31,31,31,32,31,31,30,29,30,29,30,30];
              e[2079]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2080]=[31,32,31,32,31,30,30,30,29,29,30,30];
              e[2081]=[31,32,31,32,31,30,30,30,29,30,29,31];
              e[2082]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2083]=[31,31,32,31,31,31,30,29,30,29,30,30];
              e[2084]=[31,31,32,31,31,30,30,30,29,30,30,30];
              e[2085]=[31,32,31,32,30,31,30,30,29,30,30,30];
              e[2086]=[30,32,31,32,31,30,30,30,29,30,30,30];
              e[2087]=[31,31,32,31,31,31,30,30,29,30,30,30];
              e[2088]=[30,31,32,32,30,31,30,30,29,30,30,30];
              e[2089]=[30,32,31,32,31,30,30,30,29,30,30,30];
              e[2090]=[30,32,31,32,31,30,30,30,29,30,30,30];
              e[2091]=[31,31,32,31,31,31,30,30,29,30,30,30];
              e[2092]=[30,31,32,32,31,30,30,30,29,30,30,30];
              e[2093]=[30,32,31,32,31,30,30,30,29,30,30,30];
              e[2094]=[31,31,32,31,31,30,30,30,29,30,30,30];
              e[2095]=[31,31,32,31,31,31,30,29,30,30,30,30];
              e[2096]=[30,31,32,32,31,30,30,29,30,29,30,30];
              e[2097]=[31,32,31,32,31,30,30,30,29,30,30,30];
              e[2098]=[31,31,32,31,31,31,29,30,29,30,29,31];
              e[2099]=[31,31,32,31,31,31,30,29,29,30,30,30];

              var r={year:1970,month:1,day:1},a={year:2099,month:12,day:30};

              function i(e){var t=0;return e.forEach((function(e){t+=e})),t}
              function o(e,t){var n=Date.UTC(e.year,e.month-1,e.day),r=Date.UTC(t.year,t.month-1,t.day);return Math.abs((r-n)/864e5)}
              function u(t,n){var r=0,a=0;for(a=t.year;a<=n.year;a+=1)r+=i(e[a]);for(a=0;a<t.month;a+=1)r-=e[t.year][a];for(r+=e[t.year][11],a=n.month-1;a<12;a+=1)r-=e[n.year][a];return r-=t.day+1,r+=n.day-1}
              function l(e,t){var n=new Date(f(e,d));return n.setDate(n.getDate()+t),{year:n.getFullYear(),month:n.getMonth()+1,day:n.getDate()}}
              function s(t,n){for(t.day+=n;t.day>e[t.year][t.month-1];)t.day-=e[t.year][t.month-1],t.month+=1,t.month>12&&(t.month=1,t.year+=1);return{year:t.year,month:t.month,day:t.day}}

              return{
                minDate:function(){return r},
                maxDate:function(){return a},
                countAdDays:o,
                countBsDays:u,
                addBsDays:s,
                addAdDays:l,
                bs2ad:function(e){var r=u(t,e);return l(n,r)},
                ad2bs:function(e){var r=o(n,e);return s(t,r)},
                getDaysInMonth:function(t,n){return e[t][n-1]}
              }
            }

            // Add all the remaining functions from your original file
            function s(e,t,n){var r,a=u;return n==o&&(a=d,"[object Date]"===Object.prototype.toString.call(e)&&(e={year:(r=e).getFullYear(),month:r.getMonth()+1,day:r.getDate()},t=d)),function(e){return"object"==typeof e&&e.year&&e.month&&e.day}(e)||(e=p(e,t=c(t)?t:a)),{dateObject:e,dateFormat:t}}
            function c(t){return e.indexOf(t)>-1}
            function m(e,t,n){var r=s(e,t,o);if(e=r.dateObject,t=r.dateFormat,!e)return null;var a=(new l).ad2bs(e);return t?(t=c(t)?t:d,f(a,n=c(n)?n:u)):a}
            function h(e,t,n){var r=s(e,t);if(e=r.dateObject,t=r.dateFormat,!e)return null;var a=(new l).bs2ad(e);return t?(t=c(t)?t:d,f(a,n=c(n)?n:u)):a}
            function f(t,n){var r="";function a(e){return(e=Number(e))<10?"0"+e:e}switch(n=n&&e.indexOf(n)>-1?n:u){case"MM/DD/YYYY":r=a(t.month)+"/"+a(t.day)+"/"+t.year;break;case"MM-DD-YYYY":r=a(t.month)+"-"+a(t.day)+"-"+t.year;break;case"YYYY-MM-DD":r=t.year+"-"+a(t.month)+"-"+a(t.day);break;case"YYYY/MM/DD":r=t.year+"/"+a(t.month)+"/"+a(t.day);break;case"DD-MM-YYYY":r=a(t.day)+"-"+a(t.month)+"-"+t.year;break;case"DD/MM/YYYY":r=a(t.day)+"/"+a(t.month)+"/"+t.year}return r}
            function p(e,t){if(!e||!t)return null;var n=[],r={year:null,month:null,day:null};switch(t){case"MM/DD/YYYY":3==(n=e.split("/")).length&&(r={year:Number(n[2]),month:Number(n[0]),day:Number(n[1])});break;case"MM-DD-YYYY":3==(n=e.split("-")).length&&(r={year:Number(n[2]),month:Number(n[0]),day:Number(n[1])});break;case"YYYY-MM-DD":3==(n=e.split("-")).length&&(r={year:Number(n[0]),month:Number(n[1]),day:Number(n[2])});break;case"YYYY/MM/DD":3==(n=e.split("/")).length&&(r={year:Number(n[0]),month:Number(n[1]),day:Number(n[2])});break;case"DD-MM-YYYY":3==(n=e.split("-")).length&&(r={year:Number(n[2]),month:Number(n[1]),day:Number(n[0])});break;case"DD/MM/YYYY":3==(n=e.split("/")).length&&(r={year:Number(n[2]),month:Number(n[1]),day:Number(n[0])})}return r?.year&&r?.month&&r?.day||(r=null),r}

            // Additional utility functions
            function y(e){function t(e){switch(e){case"0":return"०";case"1":return"१";case"2":return"२";case"3":return"३";case"4":return"४";case"5":return"५";case"6":return"६";case"7":return"७";case"8":return"८";case"9":return"९";default:return e}}e=e.toString();var n="",r=0;for(r=0;r<e.length;r+=1)n+=t(e[r]);return n}

            function v(e){var t=new Date;t.setHours(t.getHours()+5),t.setMinutes(t.getMinutes()+45);var n=t.getUTCDate(),r=t.getUTCMonth()+1,a={year:t.getUTCFullYear(),month:r,day:n};return e?f(a,e=c(e)?e:d):a}

            function b(e){return e=Number(e),isNaN(e)||e<0||e>6?null:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][Number(e)]}

            function D(){return["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]}

            function g(){return["S","M","T","W","T","F","S"]}

            function N(){return["January","February","March","April","May","June","July","August","September","October","November","December"]}

            function M(e,t,n,r){var a=s(e,n);if(e=a.dateObject,n=a.dateFormat,!e)return null;if(!(t=s(t,n).dateObject))return null;var i=null,o=null;switch(E(e)&&E(t)?(e=h(e),t=h(t),i=new Date(e.year,e.month-1,e.day).getTime(),o=new Date(t.year,t.month-1,t.day).getTime()):(i=1e4*e.year+100*e.month+e.day,o=1e4*t.year+100*t.month+t.day),r){case"==":return i==o;case">":return i>o;case">=":return i>=o;case"<":return i<o;case"<=":return i<=o}}

            function F(e){var t=m(v());return e?f(t,e=c(e)?e:u):t}

            function Y(e){return e=Number(e),isNaN(e)||e<0||e>6?null:["आइतवार","सोमवार","मङ्गलवार","बुधवार","बिहिवार","शुक्रवार","शनिवार"][Number(e)]}

            function A(){return["आ","सो","मं","बु","बि","शु","श"]}

            function T(e,t){var n=new l,r=n.minDate(),a=n.maxDate();return(e<r.year||e>a.year)&&(t<r.month||t>r.month)?0:n.getDaysInMonth(e,t)}

            function B(){return["आइतवार","सोमवार","मङ्गलवार","बुधवार","बिहिवार","शुक्रवार","शनिवार"]}

            function C(){return["Baisakh","Jestha","Ashar","Shrawan","Bhadra","Ashoj","Kartik","Mangsir","Poush","Magh","Falgun","Chaitra"]}

            function S(){return["बैशाख","जेठ","अषाढ","श्रावण","भाद्र","आश्विन","कार्तिक","मङ्सिर","पौष","माघ","फाल्गुन","चैत्र"]}

            function E(e,t){var n=s(e,t);if(e=n.dateObject,t=n.dateFormat,!e)return!1;var r=new l,a=r.minDate(),i=r.maxDate(),o=e.day+100*e.month+1e4*e.year,u=a.day+100*a.month+1e4*a.year;if(o>i.day+100*i.month+1e4*i.year||o<u)return!1;var d=T(e.year,e.month);return e.month>0&&e.month<=12&&e.day>0&&e.day<=d}

            return{
              AvailableFormats:e,
              Get2DigitNo:function(e){return(e<10?"0"+Number(e):e).toString()},
              ParseDate:function(e){var t=e.indexOf("/")>-1,n=e.indexOf("-")>-1,r=null;if(t){var a=e.split("/");3==a.length&&((r=o(a)).parsedFormat=r.parsedFormat.join("/"))}else if(n){var i=e.split("-");3==i.length&&((r=o(i)).parsedFormat=r.parsedFormat.join("-"))}function o(e){var t={},n=[],r=[];e.forEach((function(e,t){var n=parseInt(e),a={index:t,value:n,year:!1,month:!1,day:!1};n>0&&n>999?a.year=!0:n>0&&n>12?a.day=!0:n>0&&n<=12&&(a.month=!0,a.day=!0),r.push(a)}));var a=r.filter((function(e){return 1==e.year}))[0];if(a){t.year=a.value,n[a.index]="YYYY";var i=r.filter((function(e){return 1==e.day})),o=r.filter((function(e){return 1==e.month}));1==o.length?(t.month=o[0].value,n[o[0].index]="MM",1==i.length?(t.day=i[0].value,n[i[0].index]="DD"):(i=i.find((function(e){return!e.month})),t.day=i.value,n[i.index]="DD")):2==o.length&&(t.day=o[0==a.index?1:0].value,t.month=o[0==a.index?0:1].value,n[o[0].index]=0==a.index?"MM":"DD",n[o[1].index]=0==a.index?"DD":"MM")}if(t?.year&&t?.month&&t?.day){var u=T(t.year,t.month);t.day>u&&(t=null,n=null)}else t=null,n=null;return{parsedDate:t,parsedFormat:n}}return r},
              ConvertToDateObject:p,
              ConvertToDateFormat:f,
              AD2BS:m,
              BS2AD:h,
              ConvertToUnicode:y,
              ConvertToNumber:function(e){function t(e){switch(e){case"०":return 0;case"१":return 1;case"२":return 2;case"३":return 3;case"४":return 4;case"५":return 5;case"६":return 6;case"७":return 7;case"८":return 8;case"९":return 9;default:return e}}e=e.toString();for(var n="",r=0;r<e.length;)n+=t(e[r]),r++;return n},
              DefaultBsDateFormat:u,
              DefaultAdDateFormat:d,
              AD:{
                GetCurrentDate:v,
                GetCurrentYear:function(){var e=v();return Number(e.year)},
                GetCurrentMonth:function(){var e=v();return Number(e.month)},
                GetCurrentDay:function(){var e=v();return Number(e.day)},
                GetMonths:N,
                GetMonth:function(e){return e=Number(e),isNaN(e)||e<0||e>11?null:["January","February","March","April","May","June","July","August","September","October","November","December"][e]},
                GetDays:D,
                GetDay:b,
                GetDaysShort:g,
                GetDayShort:function(e){return e=Number(e),isNaN(e)||e<0||e>6?null:["S","M","T","W","T","F","S"][Number(e)]},
                GetDaysInMonth:function(e,t){return new Date(e,t,0).getDate()},
                DatesDiff:function(e,t,n){var r=s(e,n,o);return e=r.dateObject,n=r.dateFormat,e&&(t=s(t,n,o).dateObject)?(new l).countAdDays(e,t):null},
                AddDays:function(e,t,n){var r=s(e,n,o);return e=r.dateObject,n=r.dateFormat,(e=new Date(e.year,e.month-1,e.day)).setDate(e.getDate()+t),e={year:e.getFullYear(),month:e.getMonth()+1,day:e.getDate()},n?NepaliFunctions.ConvertToDateFormat(e,n):e},
                GetFullDate:function(e,t){var n=s(e,t,o);return e=n.dateObject,t=n.dateFormat,e?e.day+" "+NepaliFunctions.AD.GetMonth(e.month-1)+" "+e.year:null},
                GetFullDay:function(e,t){var n=s(e,t,o);return e=n.dateObject,t=n.dateFormat,e?b((e=new Date(e.year,e.month-1,e.day)).getDay()):null}
              },
              BS:{
                ValidateDate:E,
                IsBetweenDates:function(e,t,n,r,a){var i=s(e,r);if(e=i.dateObject,r=i.dateFormat,!e)return null;var o=s(t,r);if(t=o.dateObject,r=o.dateFormat,!t)return null;if(!(n=s(n,r).dateObject))return null;if(!E(e)||!E(t)||!E(n))return null;a=!0===a;var u=h(e),l=h(t),c=h(n),m=new Date(f(u,d)),p=new Date(f(l,d)),y=new Date(f(c,d)),v=!1;return a?m>=p&&m<=y&&(v=!0):m>p&&m<y&&(v=!0),v},
                GetCurrentDate:F,
                GetCurrentYear:function(){var e=F();return Number(e.year)},
                GetCurrentMonth:function(){var e=F();return Number(e.month)},
                GetCurrentDay:function(){var e=F();return Number(e.day)},
                GetMonths:C,
                GetMonth:function(e){return e=Number(e),isNaN(e)||e<0||e>11?null:["Baisakh","Jestha","Ashar","Shrawan","Bhadra","Ashoj","Kartik","Mangsir","Poush","Magh","Falgun","Chaitra"][e]},
                GetMonthsInUnicode:S,
                GetMonthInUnicode:function(e){return e=Number(e),isNaN(e)||e<0||e>11?null:["बैशाख","जेठ","अषाढ","श्रावण","भाद्र","आश्विन","कार्तिक","मङ्सिर","पौष","माघ","फाल्गुन","चैत्र"][e]},
                GetFullDate:function(e,t,n){var r=s(e,n);if(e=r.dateObject,n=r.dateFormat,!e)return null;var a=[],i="";return t?(a=["बैशाख","जेठ","अषाढ","श्रावण","भाद्र","आश्विन","कार्तिक","मङ्सिर","पौष","माघ","फाल्गुन","चैत्र"],i=y(e.day)+" "+a[e.month-1]+" "+y(e.year)):(a=["Baisakh","Jestha","Ashar","Shrawan","Bhadra","Ashoj","Kartik","Mangsir","Poush","Magh","Falgun","Chaitra"],i=e.day+" "+a[e.month-1]+" "+e.year),i},
                GetDaysUnicode:B,
                GetDayUnicode:Y,
                GetDaysUnicodeShort:A,
                GetDayUnicodeShort:function(e){return e=Number(e),isNaN(e)||e<0||e>6?null:["आ","सो","मं","बु","बि","शु","श"][Number(e)]},
                GetFullDay:function(e,t){var n=s(e,t);if(e=n.dateObject,t=n.dateFormat,!e)return null;var r=NepaliFunctions.BS2AD(e);return b((r=new Date(r.year,r.month-1,r.day)).getDay())},
                GetFullDayInUnicode:function(e,t){var n=s(e,t);if(e=n.dateObject,t=n.dateFormat,!e)return null;var r=NepaliFunctions.BS2AD(e);return Y((r=new Date(r.year,r.month-1,r.day)).getDay())},
                GetDaysInMonth:T,
                DatesDiff:function(e,t,n){var r=s(e,n);return e=r.dateObject,n=r.dateFormat,e&&(t=s(t,n).dateObject)?!(!E(e)||!E(t))&&(e=h(e),t=h(t),(new l).countAdDays(e,t)):null},
                AddDays:function(e,t,n){var r=s(e,n);if(e=r.dateObject,n=r.dateFormat,!e)return null;var a=NepaliFunctions.BS2AD(e);return(a=new Date(a.year,a.month-1,a.day)).setDate(a.getDate()+t),a={year:a.getFullYear(),month:a.getMonth()+1,day:a.getDate()},e=NepaliFunctions.AD2BS(a),n?NepaliFunctions.ConvertToDateFormat(e,n):e},
                IsEqualTo:function(e,n,r){return M(e,n,r,t)},
                IsGreaterThan:function(e,t,n){return M(e,t,n,a)},
                IsLessThan:function(e,t,r){return M(e,t,r,n)},
                IsGreaterThanOrEqualTo:function(e,t,n){return M(e,t,n,i)},
                IsLessThanOrEqualTo:function(e,t,n){return M(e,t,n,r)}
              }
            };
          }();

          // Helper functions for global access
          function bs2ad(date, format) {
            if (!format) format = "YYYY-MM-DD";
            var d = NepaliFunctions.ConvertToDateObject(date, format);
            return NepaliFunctions.BS2AD(d);
          }

          function ad2bs(date, format) {
            if (!format) format = "YYYY-MM-DD";
            var d = NepaliFunctions.ConvertToDateObject(date, format);
            return NepaliFunctions.AD2BS(d);
          }

          // Make functions available globally
          window.bs2ad = bs2ad;
          window.ad2bs = ad2bs;
          window.NepaliFunctions = NepaliFunctions;
          
          // Dispatch custom event to indicate script is loaded
          var event = new CustomEvent('nepaliDateScriptLoaded', {
            detail: { 
              NepaliFunctions: NepaliFunctions,
              bs2ad: bs2ad,
              ad2bs: ad2bs
            }
          });
          document.dispatchEvent(event);
        })();
      `;

      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };

      script.onerror = (error) => {
        console.error('Error loading Nepali date script:', error);
        reject(error);
      };

      document.head.appendChild(script);
    });
  }

  // Public methods for the service
  async toADDate(bsDate: string, format: string = 'DD/MM/YYYY'): Promise<string> {
    await this.ensureAssetsLoaded();
    
    try {
      if (!bsDate) {
        throw new Error('BS date is required');
      }

      if (!window.bs2ad || !window.NepaliFunctions) {
        throw new Error('Nepali date functions not available');
      }

      let formattedBSDate = bsDate;
      
      // Convert DD/MM/YYYY to YYYY-MM-DD format for processing
      if (format === 'DD/MM/YYYY' && bsDate.includes('/')) {
        const datearr = bsDate.split('/');
        if (datearr.length === 3) {
          formattedBSDate = `${datearr[2]}-${datearr[1].padStart(2, '0')}-${datearr[0].padStart(2, '0')}`;
        }
      }

      const adDate = window.bs2ad(formattedBSDate, "YYYY-MM-DD");
      
      if (!adDate || !adDate.year || !adDate.month || !adDate.day) {
        throw new Error('Invalid BS date conversion');
      }

      return `${adDate.year}-${adDate.month.toString().padStart(2, '0')}-${adDate.day.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error converting BS to AD:', error);
      throw error;
    }
  }

  async toBSDate(adDate: string, format: string = 'DD/MM/YYYY'): Promise<string> {
    await this.ensureAssetsLoaded();
    
    try {
      if (!adDate) {
        throw new Error('AD date is required');
      }

      if (!window.ad2bs || !window.NepaliFunctions) {
        throw new Error('Nepali date functions not available');
      }

      const bsDate = window.ad2bs(adDate, "YYYY-MM-DD");
      
      if (!bsDate || !bsDate.year || !bsDate.month || !bsDate.day) {
        throw new Error('Invalid AD date conversion');
      }

      if (format === 'DD/MM/YYYY') {
        return `${bsDate.day.toString().padStart(2, '0')}/${bsDate.month.toString().padStart(2, '0')}/${bsDate.year}`;
      } else if (format === 'YYYY-MM-DD') {
        return `${bsDate.year}-${bsDate.month.toString().padStart(2, '0')}-${bsDate.day.toString().padStart(2, '0')}`;
      }

      return `${bsDate.day.toString().padStart(2, '0')}/${bsDate.month.toString().padStart(2, '0')}/${bsDate.year}`;
    } catch (error) {
      console.error('Error converting AD to BS:', error);
      throw error;
    }
  }

  async getCurrentBSDate(format: string = 'DD/MM/YYYY'): Promise<string> {
    await this.ensureAssetsLoaded();
    
    try {
      if (!window.NepaliFunctions) {
        throw new Error('NepaliFunctions not available');
      }

      const currentBSDate = window.NepaliFunctions.BS.GetCurrentDate();
      
      if (!currentBSDate || !currentBSDate.year || !currentBSDate.month || !currentBSDate.day) {
        // Fallback: get current date and convert
        const today = new Date();
        const nepaliTime = new Date(today.getTime() + (5.75 * 60 * 60 * 1000));
        const adDate = `${nepaliTime.getUTCFullYear()}-${(nepaliTime.getUTCMonth() + 1).toString().padStart(2, '0')}-${nepaliTime.getUTCDate().toString().padStart(2, '0')}`;
        return this.toBSDate(adDate, format);
      }

      if (format === 'DD/MM/YYYY') {
        return `${currentBSDate.day.toString().padStart(2, '0')}/${currentBSDate.month.toString().padStart(2, '0')}/${currentBSDate.year}`;
      } else if (format === 'YYYY-MM-DD') {
        return `${currentBSDate.year}-${currentBSDate.month.toString().padStart(2, '0')}-${currentBSDate.day.toString().padStart(2, '0')}`;
      }

      return `${currentBSDate.day.toString().padStart(2, '0')}/${currentBSDate.month.toString().padStart(2, '0')}/${currentBSDate.year}`;
    } catch (error) {
      console.error('Error getting current BS date:', error);
      throw error;
    }
  }

  async validateNepaliDate(dateString: string, format: string = 'DD/MM/YYYY'): Promise<boolean> {
    await this.ensureAssetsLoaded();
    
    try {
      if (!dateString || !window.NepaliFunctions) {
        return false;
      }

      // Try to parse the date using NepaliFunctions
      const dateObj = window.NepaliFunctions.ConvertToDateObject(dateString, format === 'DD/MM/YYYY' ? 'DD/MM/YYYY' : format);
      
      if (!dateObj || !dateObj.year || !dateObj.month || !dateObj.day) {
        return false;
      }

      // Validate using BS validation
      return window.NepaliFunctions.BS.ValidateDate(dateObj);
    } catch (error) {
      console.error('Error validating Nepali date:', error);
      return false;
    }
  }

  async formatBSDate(dateObj: any, format: string = 'DD/MM/YYYY'): Promise<string> {
    await this.ensureAssetsLoaded();
    
    try {
      if (!dateObj || !dateObj.year || !dateObj.month || !dateObj.day || !window.NepaliFunctions) {
        throw new Error('Invalid date object or NepaliFunctions not available');
      }

      return window.NepaliFunctions.ConvertToDateFormat(dateObj, format);
    } catch (error) {
      console.error('Error formatting BS date:', error);
      throw error;
    }
  }

  async parseBSDate(dateString: string, format: string = 'DD/MM/YYYY'): Promise<any> {
    await this.ensureAssetsLoaded();
    
    try {
      if (!dateString || !window.NepaliFunctions) {
        throw new Error('Date string is required or NepaliFunctions not available');
      }

      return window.NepaliFunctions.ConvertToDateObject(dateString, format);
    } catch (error) {
      console.error('Error parsing BS date:', error);
      throw error;
    }
  }

  async getBSMonths(inUnicode: boolean = false): Promise<string[]> {
    await this.ensureAssetsLoaded();
    
    try {
      if (!window.NepaliFunctions) {
        throw new Error('NepaliFunctions not available');
      }

      return inUnicode 
        ? window.NepaliFunctions.BS.GetMonthsInUnicode()
        : window.NepaliFunctions.BS.GetMonths();
    } catch (error) {
      console.error('Error getting BS months:', error);
      return [];
    }
  }

  async getBSDays(inUnicode: boolean = false): Promise<string[]> {
    await this.ensureAssetsLoaded();
    
    try {
      if (!window.NepaliFunctions) {
        throw new Error('NepaliFunctions not available');
      }

      return inUnicode 
        ? window.NepaliFunctions.BS.GetDaysUnicode()
        : window.NepaliFunctions.AD.GetDays();
    } catch (error) {
      console.error('Error getting BS days:', error);
      return [];
    }
  }

  async convertToUnicode(numberString: string): Promise<string> {
    await this.ensureAssetsLoaded();
    
    try {
      if (!window.NepaliFunctions) {
        throw new Error('NepaliFunctions not available');
      }

      return window.NepaliFunctions.ConvertToUnicode(numberString);
    } catch (error) {
      console.error('Error converting to unicode:', error);
      return numberString;
    }
  }

  async convertToNumber(unicodeString: string): Promise<string> {
    await this.ensureAssetsLoaded();
    
    try {
      if (!window.NepaliFunctions) {
        throw new Error('NepaliFunctions not available');
      }

      return window.NepaliFunctions.ConvertToNumber(unicodeString);
    } catch (error) {
      console.error('Error converting to number:', error);
      return unicodeString;
    }
  }

  public async ensureAssetsLoaded(): Promise<void> {
    if (!this.loadingPromise) {
      this.loadingPromise = this.loadAssets();
    }
    return this.loadingPromise;
  }

  // Method to check if service is ready
  isReady(): boolean {
    return this.assetsLoaded && !!window.NepaliFunctions && !!window.bs2ad && !!window.ad2bs;
  }

  // Method to get service status
  getStatus(): { loaded: boolean; error?: string } {
    const hasGlobalFunctions = !!window.NepaliFunctions && !!window.bs2ad && !!window.ad2bs;
    
    return {
      loaded: this.assetsLoaded && hasGlobalFunctions,
      error: this.assetsLoaded && !hasGlobalFunctions ? 'Global functions not available' : undefined
    };
  }
}