package com.rhzs.erp.model.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.rhzs.erp.model.mapper.SysUserMapper;
import com.rhzs.erp.model.pojo.SysUserDO;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.List;

@SpringBootTest
@RunWith(SpringJUnit4ClassRunner.class)
public class ISysUserServiceTest {

//    @Autowired
//    private ISysUserService sysUserService;
    @Autowired
    private SysUserMapper sysUserMapper;

    @Test
    public void test1(){
//        List<SysUserDO> list = sysUserService.lambdaQuery().list();
//        list.forEach(System.out::println);

        List<SysUserDO> list = sysUserMapper.selectList(new QueryWrapper<>());
        list.forEach(System.out::println);
    }

}