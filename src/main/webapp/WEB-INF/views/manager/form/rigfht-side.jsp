<%@ page language="java" contentType="text/html; charset=EUC-KR"
    pageEncoding="EUC-KR"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="EUC-KR">
<title>Insert title here</title>
</head>
<body>

	<aside id="right">
			<div id="rtd">
				<div class="rdiv">�ֽżҽ�</div>
				<ul id="rul">
					<li>${map.qlist.get(0).content }</li>
					<li>${map.qlist.get(1).content }</li>
					<li>${map.qlist.get(2).content }</li>
					<li>${map.qlist.get(3).content }</li>
					<li>${map.qlist.get(4).content }</li>
				</ul> 
			</div>

			 <div id="re">
				<div class="rdiv">�ֽŴ��</div>
				<c:forEach items="${map.roomreview }" var="roomreview" >
				<ul id="rul">
					<li>${roomreview.roomNum }�� ${roomreview.reviewContent }</li>
				</ul>
				</c:forEach>
			</div> 

		</aside>

</body>
</html>