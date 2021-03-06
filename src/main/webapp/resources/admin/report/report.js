var checked='';
var fileUpdateSt=0;
var searchOption='';
var keyword='';

$(function(){
	getReportlist(1);
});
//리포트 보내기
function changeContent(){
	
	$("#content").val($("#ctt").val());
}
//글상세보기
function writeReport(){
	
	$("#delReportBtn").hide();
	$("#board").hide();
	$("#showlistBtn").show();
	//보고 올리기
	$(".board").show();
	$("#title").val("");
	$("#ftd").children().remove(); //파일
	var fdom='<input type="file"  name="ffname"  id="ffname"/>';
	$("#ftd").append(fdom);
	$("#ctt").val("");
	$("#cancleReportBtn").show();
	$("#cancleReportBtn").attr("onclick","noinsert()");
	$(".reply").hide();
	$("#ctt").removeAttr("disabled");
	
	$("#subtn").attr("type","submit");
	$("#subtn").removeAttr("onclick");
	$("#subtn").val("올리기");
}
function updatesReport(seq,title,fname,content){
	$("#repleBtn").attr("onclick","insertReportReply("+seq+")");
	$("#delReportBtn").hide();
	$("#board").hide();
	$("#showlistBtn").show();
	//보고 올리기
	$(".board").show();
	$("#title").val("");
	$("#ftd").children().remove(); //파일
	var fdom='<input type="file"  name="ffname"  id="ffname"/>';
	$("#ftd").append(fdom);
	$("#ctt").val("");
	$("#cancleReportBtn").show();
	$("#cancleReportBtn").attr("onclick","noinsert()");
		$(".reply").show();
		//제목
		var title=title.substring(3);
		$("#title").val(title);
		//파일 이름
		var fname=fname.substring(3);
		
		$("#ftd").children().remove(); //파일
		var fdom='<a href="resources/report/'+seq+'/'+fname+'" download="'+fname+'">'+fname+'</a>';
		$("#ftd").append(fdom);
		//내용 스필릿
		var ctt=content.substring(3);
		var ctts=ctt.replace(/<br\s*[\/]?>/gi, "\n");
		
		document.getElementById("ctt").value = ctts;
		$("#ctt").attr("disabled","disabled");
		//버튼 변경
		$("#subtn").attr("type","button");
		$("#subtn").attr("onclick","updatingReport("+seq+",'sj:"+fname+"')");
		$("#subtn").val("수정하기");
		$("#delReportBtn").show();
		$("#delReportBtn").attr("onclick","deleteReport("+seq+")");
		$("#cancleReportBtn").hide();
		$(".board #ajaxform").append(" <input type='hidden' name='seq' value='"+String(seq)+"'/>");
		console.log(seq+"여니거 없어");
		$("#inRpBtn").attr("onclick","insertReportReply("+seq+")")
		getReportReply(seq);
}
function noinsert(){
	$(".board").hide();
	$("#board").show();
	$("#showlistBtn").hide();
}
//리포트 수정
function updatingReport(seq,fname){
	var fname=fname.substring(3);
	$("#ctt").removeAttr("disabled");
	$("#subtn").val("수정완료");
	$("#ajaxform").attr("action","updateReport.do");
	$("#subtn").attr("onclick","formSubmit()");
	var fdom='&emsp;<input type="button" onclick="updatingFile('+seq+',&#039sj:'+fname+'&#039)" value="변경">';
	$("#ftd").append(fdom);
	$("#cancleReportBtn").show();
	$("#cancleReportBtn").attr("onclick","nosend()");
	$("#delReportBtn").hide();
} //파일 수정
function updatingFile(seq,fname){
	var fname=fname.substring(3);
	$("#ftd").children().remove(); //파일
	var fdom='<input type="file"  name="ffname"  id="ffname"/> <input type="button" onclick="cancleFileUpdate('+seq+',&#039sj:'+fname+'&#039)" value="취소">';
	$("#ftd").append(fdom);
	fileUpdateSt=1;
} //파일 취소
function cancleFileUpdate(seq,fname){
	var fname=fname.substring(3);
	$("#ftd").children().remove(); //파일
	var fdom='<a href="resources/report/'+seq+'/'+fname+'" download="'+fname+'">'+fname+'</a>&emsp;<input type="button" onclick="updatingFile('+seq+',&#039sj:'+fname+'&#039)" value="변경">';
	$("#ftd").append(fdom);
	fileUpdateSt=0;
}
//폼 업데이트 시기기
function formSubmit(){
	$("#subtn").attr("type","submit");
}

//리포트 검색
function searchReport(){
	keyword=$("#keyword").val();
	searchOption=$("#searchOption option:selected").val();
	getReportlist(1,searchOption,keyword);
}

//리포트 삭제
function deleteReport(seq){
	if(confirm("정말로 삭제하시겠습니까?")){
		if(seq==undefined||seq==''){
			checked=checked.substr(0,checked.length-1);
			$.ajax({
				type : 'POST',
				url : 'deleteReport.do',
				data : {seq:checked},
				success : function() {
					alert("성공적으로 삭제되었습니다.");
					getReportlist(1);
				}
			});
		}
		if(seq!=undefined&&seq!=''){
			$.ajax({
				type : 'POST',
				url : 'deleteReport.do',
				data : {seq:seq},
				success : function() {
					alert("성공적으로 삭제되었습니다.");
					getReportlist(1);
				}
			});
		}
		return;
	}else{
		alert("취소되었습니다.");
	}
	
}
//보내기 취소
function nosend(){
	$("#ctt").attr("disabled","true");
	$("#subtn").val("수정완료");
	$("#ajaxform").attr("action","insertReport.do");
	// $("#subtn").attr("onclick","formSubmit()");
	 //var fdom='&emsp;<input type="button" onclick="updatingFile('+seq+',&#039sj:'+fname+'&#039)" value="변경">';
	 //$("#ftd").append(fdom);
	$("#cancleReportBtn").hide();
	$("#delReportBtn").show();
	$(".reply").hide();
	$(".board").hide();
	$("#board").show();
	$("#showlistBtn").hide();
	$("#delReportBtn").show();
}
//리포트 가져오기
function getReportlist(curPage,searchOption,keyword){
	$(".reply").hide();
	$(".board").hide();
	$("#board").show();
	$("#showlistBtn").hide();
	var ktest =$.trim(keyword).substr(0,3);
	if(ktest=='sj:'){
		keyword=keyword.substring(3);	
	}
	$.ajax({
		type : 'POST',
		url : 'getReportlist.do',
		data : {curPage:curPage,searchOption:searchOption,keyword:keyword,type:'admin'},
		success : function(data) {
			$("#write").text("");
			$("#write").append(data.count+"개의 개시물이 있습니다.");
			$("#boardtable tbody").children().remove();
			var dom='';
			for(var i=0; i<data.list.length; i++){
				dom+='<tr>';
				dom+='<td>'+data.list[i].num+'</td>';   //들어가면 title이 잇으면 경로를 따로 줌  //보고 올리기 버튼을 수정하기로 수정 //나중에 css에서 커서 처리
				dom+='<td>'+data.list[i].branchName+'</td>';
				dom+='<td>'+data.list[i].name+'</td>';
				dom+='<td onclick="updatesReport('+data.list[i].seq+',&#039sj:'+data.list[i].title+'&#039,&#039sj:'+data.list[i].fname+'&#039,&#039sj:'+data.list[i].content+'&#039)">'+data.list[i].title+'</td>'; //클릭시 write에다가 title, content, 첨부파일 이름 넣어주기
				dom+='<td>'+data.list[i].regdate+'</td>';
				dom+='<td><input id="chk'+data.list[i].seq+'" type="checkbox" onclick="checkSeq('+data.list[i].seq+')"/></td>'; //삭제 누르면 한방에 삭제 
				dom+='</tr>';
			}
			if(data.list.length==0){
				dom+='<tr><td colspan="5">게시글이 없습니다.</td></tr>';
			}
			$("#boardtable tbody").append(dom);
			blockPage("pnum",curPage,data.pager.BLOCK_SCALE,data.pager.totPage,"pli","getReportlist",searchOption,keyword);
		}
	});
}
function replaceAll(str, searchStr, replaceStr) {
	  return str.split(searchStr).join(replaceStr);
}
function checkSeq(seq){
	checked+=seq+",";
	$("#chk"+seq).attr("onclick","uncheck("+seq+")");
}
function uncheck(seq){
	var scsplit=checked.split(seq+",");
	checked=scsplit[0]+scsplit[1];
	$("#chk"+seq).attr("onclick","checkSeq("+seq+")");
}
function insertboard() {

	$("#board").load("boardinsert.do");
}
