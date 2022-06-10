var speakers_data = [];
var speaker_info_data = [];
var reformatted_data = [];

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

function reformatSpeakers_data(speakers_data,speaker_info_data){
  for (let speakerloop=0; speakerloop<speakers_data.length; speakerloop++){
    let reformatted_data_temp = {name:"",styles:[]};
    reformatted_data_temp.name = speakers_data[speakerloop].name;
//          reformatted_data_temp.policy = speaker_info_data[speakerloop].policy;
    reformatted_data_temp.portrait = speaker_info_data[speakerloop].portrait;
    if(speakers_data[speakerloop].styles.length=="1"){
      reformatted_data_temp.singlestyle = "true";
      reformatted_data[speakerloop] = reformatted_data_temp;
      reformatted_data_temp.styles.id = speakers_data[speakerloop].styles[0].id;
      reformatted_data_temp.styles.icon = speaker_info_data[speakerloop].style_infos[0].icon;
      reformatted_data[speakerloop].styles.push(reformatted_data_temp.styles);
    }else{
      reformatted_data_temp.singlestyle = "false";
      reformatted_data[speakerloop] = reformatted_data_temp;
      for (let styleloop=0; styleloop<speakers_data[speakerloop].styles.length; styleloop++){
        let reformatted_data_temp = {styles:[]};
        reformatted_data_temp.styles.name = speakers_data[speakerloop].styles[styleloop].name;
        reformatted_data_temp.styles.id = speakers_data[speakerloop].styles[styleloop].id;
        reformatted_data_temp.styles.icon = speaker_info_data[speakerloop].style_infos[styleloop].icon;
        reformatted_data[speakerloop]['styles'].push(reformatted_data_temp.styles);
      }
    }
  }
  return reformatted_data;
}



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

async function getdata(api_url){
  let speakers_data = await getspeakers(api_url);
  let speaker_info_data = await getspeaker_info(api_url,speakers_data);
  return [speakers_data,speaker_info_data] ;
}

 


async function pushexec(){
  console.log('button click');
  const libtype = $('input:radio[name="engine"]:checked').val();
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

}
