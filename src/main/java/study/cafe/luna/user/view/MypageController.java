package study.cafe.luna.user.view;

import java.io.PrintWriter;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.StringTokenizer;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.support.RequestContextUtils;

import study.cafe.luna.member.dto.MemberDTO;
import study.cafe.luna.member.service.MemberService;
import study.cafe.luna.payandreserve.service.PayAndReserveService;
import study.cafe.luna.payment.dto.RoomPaymentDTO;
import study.cafe.luna.payment.dto.RoomReserveDTO;
import study.cafe.luna.room.dto.RoomInfoDTO;
import study.cafe.luna.util.SHA256;

@Controller
public class MypageController {
	
	@Autowired
	MemberService memser;
	@Autowired
	PayAndReserveService parser;
	
	@RequestMapping(value="/mypage.do", method=RequestMethod.GET)
	public ModelAndView mypageView(HttpSession session, MemberDTO memcom,HttpServletRequest request) {
		ModelAndView mav=new ModelAndView();
		
		Map<String, ?> flashMap=RequestContextUtils.getInputFlashMap(request);
		if(flashMap!=null) {
			memcom.setId(flashMap.get("id").toString());
			session.setAttribute("member", memcom);
		}else {
			memcom=(MemberDTO)session.getAttribute("member");
		}
				
		session.setAttribute("member", memcom);
		
		memcom=memser.getMyPageInfo(memcom);
		mav.addObject("member",memcom);
		mav.setViewName("/user/mypage");
		return mav;
	}
	@Transactional
	@RequestMapping(value="/mypage.do", method=RequestMethod.POST)
	public ModelAndView mainView(@RequestParam(value="stat", required=false,defaultValue="")String stat,RoomReserveDTO romre,HttpServletResponse respone,HttpServletRequest req,RedirectAttributes rdab,HttpSession session,MemberDTO memcom,RoomInfoDTO romin, RoomPaymentDTO rompay) throws Exception{
		ModelAndView mav=new ModelAndView();
		
		MemberDTO memcomID=(MemberDTO)session.getAttribute("member");
		memcom.setId(memcomID.getId());
		
		int paystatus=rompay.getStatus();
		
		if(paystatus==1) {
			//날짜로 변환
			DateTimeFormatter formatter=DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
			long unixTime = rompay.getPaid_ats();
			String formattedDtm = Instant.ofEpochSecond(unixTime).atZone(ZoneId.of("GMT-4")).format(formatter);
			rompay.setPaid_at(formattedDtm);
			
			//예약 테이블 확인
			romre.setRoomNum(romin.getRoomNum());
			
//			//디비에 결제가 들어가있는지 먼저 확인
//			romre.setStartdate(rompay.getReservdate());
//			StringTokenizer st=new StringTokenizer(rompay.getReserveTime(), ",");
//			while(st.hasMoreTokens()) {
//				romre.setReservstate(st.nextToken());
//				Integer result=parser.checkIsPayed(romre);
//				if(result!=null) {
//					respone.setContentType("text/html; charset=UTF-8");
//					PrintWriter out = respone.getWriter();
//					respone.setCharacterEncoding("utf-8");
//					out.println("<script>alert('죄송합니다. 방금전 고객님께서 예약하신 시간대가 마감되었습니다.'); history.go(-1);</script>");
//					out.flush();
//					return;
//				}
//			}	 --테스터 파라미터중 결제 직전 콜백 메서드가 없어 결제가 되버리므로 처리 못함
			if(rompay.getReserveEndTime()==""||rompay.getReserveEndTime()==null) {
				romre.setStartdate(rompay.getReservdate());
				romre.setReservstate(rompay.getReserveTime());
				Integer sdresult=parser.checkReservStartdate(romre);
			
				//row가 없으면 insert
				if(sdresult==null) {
					parser.inReserveRoom(romre);
				}else{//있으면 update
					romre.setReservNumber(sdresult);
					parser.upReserveRoom(romre);
				}
				
			}else{
				romre.setStartdate(rompay.getReservdate());
				romre.setReservstate(rompay.getReserveTime());
				Integer sdresult=parser.checkReservStartdate(romre);
				//row가 없으면 insert
				if(sdresult==null) {
					parser.inReserveRoom(romre);
				}else{//있으면 update
					romre.setReservNumber(sdresult);
					parser.upReserveRoom(romre);
				}
				romre.setStartdate(rompay.getReservenddate());
				romre.setReservstate(rompay.getReserveEndTime());
				Integer sdresult2=parser.checkReservStartdate(romre);
				
				//row가 없으면 insert
				if(sdresult2==null) {
					parser.inReserveRoom(romre);
				}else{//있으면 update
					romre.setReservNumber(sdresult2);
					parser.upReserveRoom(romre);
				}
			}
			rompay.setId(memcom.getId());
			parser.inRoomPayment(rompay);
			rompay.setStatus(0);
		}
	
		if(stat.equals("1")) {
			SHA256 sha=SHA256.getInsatnce();
			String shaPass=sha.getSha256(memcom.getPw().getBytes());
			memcom.setPw(shaPass);
			memser.upUserInfo(memcom);
			memcom.setPw("");
		}else if(stat.equals("2")) {
			memser.upUserInfo(memcom);
		}
		
		
		rdab.addFlashAttribute("id", memcom.getId());
		mav.setViewName("redirect:/mypage.do");
		return mav;	
	}
}
