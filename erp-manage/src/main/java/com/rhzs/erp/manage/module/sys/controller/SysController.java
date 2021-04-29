package com.rhzs.erp.manage.module.sys.controller;

import com.rhzs.erp.model.pojo.SysUserDO;
import com.rhzs.erp.model.service.ISysUserService;
import com.rhzs.erp.model.vo.UserVo;
import com.sun.deploy.net.HttpRequest;
import net.sf.json.JSONObject;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.SimpleFormatter;
import java.util.stream.Collectors;

@RestController
public class SysController {
    @Autowired
    private ISysUserService userService;




    @RequestMapping("/list")
    public Map<String,Object> getUserById(){
        List<SysUserDO> u= userService.list();
        DateTimeFormatter sdf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    List<UserVo> list = u.stream().map(data ->{
        UserVo vo =new UserVo();
        BeanUtils.copyProperties(data,vo);
        if (data.getSex()==1){
            vo.setSexStr("男");
            }else{
            vo.setSexStr("女");
            }
        vo.setTiemStr(sdf.format(data.getBirthday()));
        return vo;
    }).collect(Collectors.toList());

        Map<String,Object> map=new HashMap<>();
        map.put("list",list);
        return map;
    }


    @RequestMapping("/delete")
    @ResponseBody
    public Map<String,Object> delete(@RequestBody String userId){
        userService.removeById(userId);
        Map<String,Object> map=new HashMap<>();
        map.put("result",1);
        return map;
    }

}
