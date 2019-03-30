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
});

const app = new Vue ({
  el: '#app',
  data:{
    storage: [],
    data: [],
    locations: [],
    stared: [],
    filter: '全部城市',
    currentPage: 0,
    pages: 0,
  },
  computed: {
    filterData() { 
      const vm = this;
      let items = [];
      if(vm.filter == '全部城市') {
        items = vm.data;        
      } else {
        items = vm.data.filter((value) => {
          return vm.filter == value.County;
        });
      }
      const newData = [];
      items.forEach((item, i) => {
        if(i % 9 === 0) {
          newData.push([]);
        }
        const page = parseInt(i / 9);
        newData[page].push(item);
      });
      vm.pages = newData.length
      vm.currentPage = 0;
      return newData;     
    },
  },
  methods: {
    getData() {
      const vm = this;
      const api = 'http://opendata2.epa.gov.tw/AQI.json';
      const queryUrl = 'https://cors-anywhere.herokuapp.com/' + api;
      $.get(queryUrl).then((response) => {
        vm.data = response;
        vm.getUniqueCounty();
        vm.getStorage();
      });
    },
    getUniqueCounty() {
      const vm = this;
      const county = new Set();
      vm.data.forEach((value) => {
        county.add(value.County);
      });      
      vm.locations = Array.from(county);
    },
    getStorage() {
      const vm = this;
      vm.storage = JSON.parse(localStorage.getItem('SiteName')) || [];
      vm.data.forEach((value1) => {                             
        vm.storage.forEach((value2) => {
          if (value1.SiteName == value2.SiteName) {
            vm.$set(value1, 'checked', true);
            vm.stared.push(value1);
          }
        });
      });
    },
    addStared(item) {
      const vm = this;
      let newIndex = vm.stared.findIndex((value) => {
        return value.SiteName === item.SiteName;
      });
      if (newIndex === -1){
        Vue.set(item, 'checked', true);
        vm.stared.push(item);
      } else {
        vm.$set(item, 'checked', false);
        vm.stared.splice(newIndex, 1);
      }
      localStorage.setItem('SiteName', JSON.stringify(vm.stared));
    },
  },  
  created() {
    this.getData();    
  }
});
