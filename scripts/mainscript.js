var speakers_data = [];
var speaker_info_data = [];
var reformatted_data = [];
var check_id = [];
var select_index = [];
var libtype;


//    画面を読みこんだら実行      
window.addEventListener('DOMContentLoaded', function(){
  var input_engines = document.querySelectorAll("input[name=engine]");

  for(var element of input_engines) {
    element.addEventListener('change',function(){
      document.getElementById(execution);
      execution.disabled = false;
    });

  }
});

//speakersのAPI実行
function getspeakers(api_url){
  return new Promise ((resolve) => {
    console.log("Start getting speakers");
    let speakers_data = $.getJSON(`${api_url}speakers`, (speakers)=>{
        speakers_data = speakers;
        return speakers_data;
      });
    console.log("Got speakers")
    resolve(speakers_data);
  });
}

//取得データの整理
function reformatSpeakers_data(speakers_data,speaker_info_data){
  let img_temp;
  for (let speakerloop=0; speakerloop<speakers_data.length; speakerloop++){
    let reformatted_data_temp = {name:"",styles:[]};
    reformatted_data_temp.name = speakers_data[speakerloop].name;
    reformatted_data_temp.portrait = speaker_info_data[speakerloop].portrait;
    if(speakers_data[speakerloop].styles.length=="1"){
      reformatted_data_temp.singlestyle = "true";
      reformatted_data[speakerloop] = reformatted_data_temp;
      reformatted_data_temp.styles.id = speakers_data[speakerloop].styles[0].id;
      img_temp = "data:image/png;base64," + speaker_info_data[speakerloop].style_infos[0].icon;
//      reformatted_data_temp.styles.icon = speaker_info_data[speakerloop].style_infos[0].icon;
      reformatted_data_temp.styles.icon = img_temp;
      reformatted_data[speakerloop].styles.push(reformatted_data_temp.styles);
    }else{
      reformatted_data_temp.singlestyle = "false";
      reformatted_data[speakerloop] = reformatted_data_temp;
      for (let styleloop=0; styleloop<speakers_data[speakerloop].styles.length; styleloop++){
        let reformatted_data_temp = {styles:[]};
        reformatted_data_temp.styles.name = speakers_data[speakerloop].styles[styleloop].name;
        reformatted_data_temp.styles.id = speakers_data[speakerloop].styles[styleloop].id;
        img_temp = "data:image/png;base64," + speaker_info_data[speakerloop].style_infos[styleloop].icon;
//        reformatted_data_temp.styles.icon = speaker_info_data[speakerloop].style_infos[styleloop].icon;
        reformatted_data_temp.styles.icon = img_temp;
        reformatted_data[speakerloop]['styles'].push(reformatted_data_temp.styles);
      }
    }
  }
  return reformatted_data;
}


//speaker_infoのAPI実行
async function getspeaker_info(api_url,speakers_data){

  let results = [];
    console.log("Start getting speaker info");
      for (let i=0; i<speakers_data.length; i++){
        results.push(
        $.getJSON(`${api_url}speaker_info?speaker_uuid=${speakers_data[i].speaker_uuid}`, (speaker_info)=>{
        }));
      };
  let speaker_info_data = (await Promise.all(results));
  console.log("Got speaker info")
  return speaker_info_data;
}

//API実行の呼び出し
async function getdata(api_url){
  let speakers_data = await getspeakers(api_url);
  let speaker_info_data = await getspeaker_info(api_url,speakers_data);
  return [speakers_data,speaker_info_data] ;
}

//ツリー作成
function maketree(data){
    let ul_root_element = document.createElement('ul');
    let j1count = 1;
    let indexcount = 0;
    for(let i=0; i<data.length; i++){
        let li_speaker_element = document.createElement('li');
        li_speaker_element.setAttribute("data-jstree",`{"opened":true}`);
        li_speaker_element.textContent = data[i].name;
        if(data[i].singlestyle == "true"){
          check_id[indexcount] = `j1_${j1count}`;
          j1count++;
          indexcount++;
          ul_root_element.appendChild(li_speaker_element);
        }else{
          j1count++;
          ul_root_element.appendChild(li_speaker_element);
          let ul_styles_element = document.createElement('ul');
          for(let j=0; j<data[i].styles.length; j++){
              let li_styles_element = document.createElement('li');
              li_styles_element.textContent = data[i].styles[j].name;
              check_id[indexcount] = `j1_${j1count}`              
              j1count++;
              indexcount++;
      //jstreeによって割り当てられるidを予測し、配列へ順に入れることでチェックボックスの状況からインデックスを取得する
              ul_styles_element.appendChild(li_styles_element);
          }
          li_speaker_element.appendChild(ul_styles_element);
          ul_root_element.appendChild(li_speaker_element);
        }
    }
    var Tree1 = document.getElementById('Tree1');
    Tree1.appendChild(ul_root_element);
    return check_id;

}
 

//実行ボタンを押したとき
async function pushexec(){
  console.log('button click');
  libtype = $('input:radio[name="engine"]:checked').val();
  console.log(`libtype=${libtype}`);
  if(libtype=="voicevox"){
    var port_number = "50021";
  }else if(libtype=="coeiroink"){
    var port_number = "50031";
  }
  let api_url = `http://localhost:${port_number}/`;
  console.log(api_url);

  let API_data = await getdata(api_url);

/*         speakers_data = API_data[0];
  speaker_info_data = API_data[1];
*/        
  reformatted_data = reformatSpeakers_data(API_data[0],API_data[1]);

  console.log(reformatted_data[0].styles.length);
  console.log(reformatted_data[0].styles[0].name);

  check_id = maketree(reformatted_data);

  //JSTree適用
  $(function(){$('#Tree1').jstree({
    "plugins":["wholerow","checkbox"],
    "core": {
      "themes":{
        "icons":false
      }
    }
  });});
  document.getElementById('submit');
  submit.disabled = false;
  return libtype;
}

//確定ボタン
function submitMe() {
  select_index = [];
  let result = $('#Tree1').jstree('get_selected');
  console.log(result);
  console.log(check_id);

  for(i=0; i<result.length; i++){
    let temp_index = check_id.indexOf(result[i]);
    let flg = Math.sign(temp_index);
    if(flg == 1){
      select_index.push(temp_index);
    }
  }
  console.log(select_index);
  return select_index;
}

async function Export_lib(){
  if(libtype == "voicevox"){
    //VOICEVOXの処理
    templete_path="../template/VOICEVOX/"
  }else{
    //COEIROINKの処理
    templete_path="../template/COEIROINK/"
  }
}