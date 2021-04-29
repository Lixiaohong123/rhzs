package com.rhzs.erp.model.vo;

import com.rhzs.erp.model.pojo.SysUserDO;

public class UserVo extends SysUserDO {

    private String sexStr;
    private String tiemStr;

    public String getSexStr() {
        return sexStr;
    }

    public void setSexStr(String sexStr) {
        this.sexStr = sexStr;
    }

    public String getTiemStr() {
        return tiemStr;
    }

    public void setTiemStr(String tiemStr) {
        this.tiemStr = tiemStr;
    }
}
