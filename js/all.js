Vue.component('card', {
  props: ['city','index'],
  template: '#AQI',
  
  methods: {
    toggleStar() {
      this.$emit('toggle-star');
    }
  },
  computed: {
    status() {
      const vm = this;
      const status = vm.city.Status;
      switch (status) {
        case '良好': return 'status-aqi1';
        case '普通': return 'status-aqi2';
        case '對敏感族群不健康': return 'status-aqi3';
        case '對所有族群不健康': return 'status-aqi4';
        case '非常不健康': return 'status-aqi5';
        case '危害': return 'status-aqi6';
        default : return 'bg-light';  
      }
    }
  }  
      // if (status == '良好') {
      //   return 'status-aqi1';       
      // }
      // else if (status == '普通') {
      //   return 'status-aqi2';
      // }  
      // else if (status == '對敏感族群不健康') {
      //   return 'status-aqi3';       
      // } 
      // else if (status == '對所有族群不健康') {
      //   return 'status-aqi4';       
      // } 
      // else if (status == '非常不健康') {
      //   return 'status-aqi5';       
      // } 
      // else if (status == '危害') {
      //   return 'status-aqi6';
      // }
});

const app = new Vue ({
  el: '#app',
  data:{
    storage: [],  // localstorage 暫存區
    data: [],     // 環保署 AQI JSON 資料
    location: [], // 下拉式選單 option(城市)
    stared: [],   // 關注城市
    filter: '',   // 下拉式選單 value
    currentPage: 0,
    pages: 0,
  },
  methods: {
    getData() {
      const vm = this;
      const api = 'http://opendata2.epa.gov.tw/AQI.json';
      const queryUrl = 'https://cors-anywhere.herokuapp.com/' + api;
      // 使用 jQuery AJAX
      $.get(queryUrl).then((response) => {
        vm.data = response;
        console.log(vm.data);
        vm.getUniqueCounty();
        vm.getStorage();
      });
      // $.ajax({
      //   method: 'GET', // 預設為 GET method
      //   url: queryUrl,
      // })
      // .done(function(response) {
      //   //console.log(response);
      //   //console.log(typeof(response));
      //   vm.data = response;
      //   vm.getUniqueCounty();
      //   vm.getStorage();
      // });
    },
    getUniqueCounty() {
      const vm = this;
      const county = new Set(); // 使用 ES6 中的 set() 取出唯一值
      vm.data.forEach((value) => {  // 取出 data 內的城市資料
        county.add(value.County)
      });      
      vm.location = Array.from(county);
    },
    getStorage() {
      const vm = this;
      // 取出 localstorage 資料
      vm.storage = JSON.parse(localStorage.getItem('SiteName')) || []; 
      // 更新關注城市(stared 陣列)裡資料
      vm.data.forEach((value1) => {                             
        vm.storage.forEach((value2) => {
          if (value1.SiteName == value2.SiteName) {
            vm.$set(value1, 'checked', true);
            vm.stared.push(value1);
          }
        })
      });
    },
    // 點擊 star 的地區加入關注城市陣列 stared
    addStared(item) { // item 是 v-for 從 filterData 陣列內取出的元素
      // console.log(item);
      const vm = this;
      let newIndex = vm.stared.findIndex((value) => { // 找出 stared 陣列內符合 return 條件的元素，返回其 index
        return value.SiteName === item.SiteName;  //  vlaue 是 findIndex 從 stared 陣列取出的元素
      })
      // console.log(newIndex);

      if (newIndex === -1){ // -1 表示沒有相同 SiteName 的元素
        Vue.set(item, 'checked', true); // 設定 checked
        vm.stared.push(item); // 將 item 新增至 stared 陣列
      }
      else {
        vm.$set(item, 'checked', false);
        vm.stared.splice(newIndex, 1);
      }
      localStorage.setItem('SiteName', JSON.stringify(vm.stared))
    },
  },  
  computed: {
    filterData() { 
      const vm = this;
      let items = [];    
      // console.log(vm.filter);

      if (!vm.filter || vm.filter == '全部城市') {
        items = vm.data;        
      } else {
        items = vm.data.filter((value) => {
          return vm.filter == value.County;
        });
      }
      const newData = [];
      items.forEach((item, i) => {
        if (i % 9 === 0) {
          newData.push([]);
        }
        const page = parseInt(i / 9);
        newData[page].push(item);
      });
      vm.pages = newData.length // 分頁數量
      vm.currentPage = 0;
      // console.log(newData);
      return newData;     
    },
  },
  created() {
    this.getData();    
  }
});

      