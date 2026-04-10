import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = new URL('..', import.meta.url);

const read = (relativePath) => readFileSync(join(rootDir.pathname, relativePath), 'utf8');

const checks = [
  {
    name: 'ReceiptPrint reads receipt detail directly from request wrapper',
    run() {
      const content = read('src/components/ReceiptPrint/index.tsx');
      return !content.includes('setReceiptData(response.data);');
    },
  },
  {
    name: 'Contract detail reads receipt detail directly from request wrapper',
    run() {
      const content = read('src/pages/finance/contract/Detail.tsx');
      return !content.includes('setReceiptData(response.data);');
    },
  },
  {
    name: 'Revenue dashboard imports message before using message.error',
    run() {
      const content = read('src/pages/dashboard/revenue/index.tsx');
      const importsMessage = /import\s*\{[\s\S]*\bmessage\b[\s\S]*\}\s*from 'antd';/.test(content);
      return !content.includes('message.error(') || importsMessage;
    },
  },
  {
    name: 'Message center consistently uses antMessage alias',
    run() {
      const content = read('src/pages/notification/message/index.tsx');
      return !/\n\s*message\.error\(/.test(content);
    },
  },
  {
    name: 'Payment page no longer reads paged records from response.data',
    run() {
      const content = read('src/pages/finance/payment/index.tsx');
      return !content.includes('response.data.records') && !content.includes('response.data.total');
    },
  },
  {
    name: 'Student list does not hardcode campusId and wires campus filter to params',
    run() {
      const content = read('src/pages/student/list/index.tsx');
      return (
        !content.includes('campusId: 1,') &&
        content.includes('params.campusId') &&
        content.includes('name="campusId"')
      );
    },
  },
  {
    name: 'Student status filter uses dropout value for suspended backend status',
    run() {
      const content = read('src/pages/student/list/index.tsx');
      return (
        content.includes("{ label: '休学', value: 'dropout' }") &&
        !content.includes("{ label: '休学', value: 'suspended' }")
      );
    },
  },
  {
    name: 'Contract add form collects course line fields instead of defaulting them',
    run() {
      const content = read('src/pages/finance/contract/index.tsx');
      return (
        content.includes('name="courseId"') &&
        content.includes('name="quantity"') &&
        content.includes('name="unitPrice"') &&
        !content.includes('courseId: values.courseId || 0')
      );
    },
  },
  {
    name: 'Contract API unwraps list responses before mapping or consuming them',
    run() {
      const content = read('src/api/contract.ts');
      return (
        content.includes('const unwrapList = <T>(payload: unknown): T[] => {') &&
        content.includes('unwrapList<BackendContractItem>(') &&
        content.includes('unwrapList<BackendPaymentRecord>(') &&
        content.includes('unwrapList<BackendHourAccount>(') &&
        content.includes('unwrapList<BackendRefundApplication>(') &&
        content.includes('unwrapList<ContractApproval>(') &&
        content.includes('unwrapList<ContractApprovalFlow>(') &&
        content.includes('unwrapList<ContractPrintRecord>(') &&
        content.includes('unwrapList<ContractPrintTemplate>(')
      );
    },
  },
  {
    name: 'Batch contract print sends ids as request params for backend compatibility',
    run() {
      const content = read('src/api/contract.ts');
      return (
        /http\.post<unknown>\('\/finance\/contract\/print\/batch', null, \{[\s\S]*params: \{ contractIds, templateId \}/.test(content)
      );
    },
  },
  {
    name: 'Class hour adjust helper preserves optional remark in submitted reason',
    run() {
      const content = read('src/api/classHour.ts');
      return (
        content.includes('const mergedReason = data.remark') &&
        content.includes('reason: mergedReason')
      );
    },
  },
  {
    name: 'Class hour warning filter is handled by backend-compatible status query',
    run() {
      const content = read('src/api/classHour.ts');
      return (
        content.includes('status: params.status,') &&
        !content.includes("params.status === 'warning' ? 'active' : params.status") &&
        !content.includes(".filter((item) => (params.status === 'warning' ? item.remainingHours <= 10 : true))")
      );
    },
  },
  {
    name: 'Dashboard pages no longer assume http responses must be read from .data',
    run() {
      const revenue = read('src/pages/dashboard/revenue/index.tsx');
      const teaching = read('src/pages/dashboard/teaching/index.tsx');
      const enrollment = read('src/pages/dashboard/enrollment/index.tsx');
      return (
        !revenue.includes('overviewRes.data') &&
        !teaching.includes('result.data') &&
        !enrollment.includes('overviewRes.data') &&
        !enrollment.includes('trendRes.data')
      );
    },
  },
  {
    name: 'System list pages no longer assume paged responses must be read from .data',
    run() {
      const classroom = read('src/pages/system/Classroom/index.tsx');
      const config = read('src/pages/system/Config/index.tsx');
      const holiday = read('src/pages/system/Holiday/index.tsx');
      return (
        !classroom.includes('response.data.list') &&
        !config.includes('response.data.list') &&
        !holiday.includes('response.data.list')
      );
    },
  },
  {
    name: 'Export helpers are either wired to backend exports or use local fallback intentionally',
    run() {
      const checks = [
        read('src/api/attendance.ts').includes("downloadCsv('考勤统计.csv'"),
        read('src/api/classroom.ts').includes("downloadUrl") && read('src/api/classroom.ts').includes("教室列表.csv"),
        read('src/api/config.ts').includes("downloadUrl") && read('src/api/config.ts').includes("系统参数列表.csv"),
        read('src/api/coursePackage.ts').includes("downloadCsv('课程包列表.csv'"),
        read('src/api/holiday.ts').includes("downloadUrl") && read('src/api/holiday.ts').includes("节假日列表.csv"),
        read('src/api/lead.ts').includes("'/marketing/lead/export'"),
        read('src/api/operationLog.ts').includes("downloadUrl") && read('src/api/operationLog.ts').includes("操作日志.csv"),
        read('src/api/teacher.ts').includes("downloadCsv('教师列表.csv'"),
      ];
      return checks.every(Boolean);
    },
  },
  {
    name: 'Dashboard pie charts do not mutate currentAngle during render',
    run() {
      const dashboard = read('src/pages/dashboard/index.tsx');
      const teaching = read('src/pages/dashboard/teaching/index.tsx');
      const enrollment = read('src/pages/dashboard/enrollment/index.tsx');
      return (
        !dashboard.includes('currentAngle = endAngle;') &&
        !teaching.includes('currentAngle = endAngle;') &&
        !enrollment.includes('currentAngle = endAngle;')
      );
    },
  },
  {
    name: 'CommonTable README does not point to deleted example files',
    run() {
      const content = read('src/components/CommonTable/README.md');
      return !content.includes('/src/pages/examples/TableExample.tsx');
    },
  },
  {
    name: 'Contract paid amount maps from receivedAmount instead of payable amount fallback',
    run() {
      const content = read('src/api/contract.ts');
      return (
        content.includes('paidAmount: toNumber(contract.receivedAmount),') &&
        !content.includes('contract.receivedAmount ?? contract.paidAmount')
      );
    },
  },
  {
    name: 'Contract item discount is derived from stored amount instead of hardcoded zero',
    run() {
      const content = read('src/api/contract.ts');
      return (
        content.includes('const originalPrice = toNumber(item.unitPrice) * quantity;') &&
        content.includes('const discountAmount = Math.max(0, originalPrice - totalPrice);') &&
        !content.includes('const discountAmount = 0;')
      );
    },
  },
  {
    name: 'Contract create API unwraps boolean success response instead of expecting an id payload',
    run() {
      const content = read('src/api/contract.ts');
      return (
        content.includes("return unwrap<boolean>(await http.post<unknown>('/finance/contract', {") &&
        !content.includes("return http.post<{ id: number }>('/finance/contract', {")
      );
    },
  },
  {
    name: 'Contract hour account gift hours are kept as giftHours all the way to the detail page',
    run() {
      const apiContent = read('src/api/contract.ts');
      const typesContent = read('src/types/contract.ts');
      const detailContent = read('src/pages/finance/contract/Detail.tsx');
      return (
        apiContent.includes('giftHours: toNumber(account.giftHours),') &&
        !apiContent.includes('frozenHours: toNumber(account.frozenHours ?? account.giftHours)') &&
        typesContent.includes('giftHours: number; // 赠送课时') &&
        !typesContent.includes('frozenHours: number; // 冻结课时') &&
        detailContent.includes("dataIndex: 'giftHours'") &&
        !detailContent.includes("dataIndex: 'frozenHours'")
      );
    },
  },
  {
    name: 'Class removal forwards leaveDate and no longer asks for an unpersisted reason',
    run() {
      const apiContent = read('src/api/class.ts');
      const detailContent = read('src/pages/teaching/class/Detail.tsx');
      return (
        apiContent.includes('return http.delete(`/teaching/class/${data.classId}/students/${data.studentId}`, {') &&
        apiContent.includes('params: { leaveDate: data.leaveDate },') &&
        !detailContent.includes('name="reason"') &&
        !detailContent.includes('退班原因')
      );
    },
  },
  {
    name: 'Class assignment forwards joinDate and no longer asks for an unpersisted remark',
    run() {
      const apiContent = read('src/api/class.ts');
      const typesContent = read('src/types/class.ts');
      const detailContent = read('src/pages/teaching/class/Detail.tsx');
      const backendController = read('../edu-server/edu-teaching/src/main/java/com/edu/teaching/controller/TeachClassController.java');
      const backendService = read('../edu-server/edu-teaching/src/main/java/com/edu/teaching/service/impl/TeachClassServiceImpl.java');
      const assignParamsBlock = /export interface AssignStudentParams \{[\s\S]*?\n\}/.exec(typesContent)?.[0] || '';
      const addStudentModalBlock = /<Form form=\{addStudentForm\} layout="vertical">[\s\S]*?<\/Form>/.exec(detailContent)?.[0] || '';
      return (
        apiContent.includes('return http.post(`/teaching/class/${data.classId}/students`, data.studentIds, {') &&
        apiContent.includes('params: { joinDate: data.joinDate },') &&
        assignParamsBlock.includes('joinDate: string;') &&
        !assignParamsBlock.includes('remark?: string;') &&
        !addStudentModalBlock.includes('name="remark"') &&
        !addStudentModalBlock.includes('请输入备注信息') &&
        backendController.includes('@RequestParam(required = false) LocalDate joinDate') &&
        backendService.includes('LocalDate resolvedJoinDate = joinDate != null ? joinDate : LocalDate.now();') &&
        backendService.includes('relation.setJoinDate(resolvedJoinDate);')
      );
    },
  },
  {
    name: 'Legacy refund helper is removed from contract API so refund flow has a single source of truth',
    run() {
      const apiContent = read('src/api/contract.ts');
      const typesContent = read('src/types/contract.ts');
      return (
        !apiContent.includes('export const applyRefund = (data: RefundFormData) => {') &&
        !typesContent.includes('export interface RefundFormData {')
      );
    },
  },
  {
    name: 'Contract update path uses the same compatibility form mapping on both frontend and backend',
    run() {
      const frontendContent = read('src/api/contract.ts');
      const backendController = read('../edu-server/edu-finance/src/main/java/com/edu/finance/controller/ContractController.java');
      const backendService = read('../edu-server/edu-finance/src/main/java/com/edu/finance/service/impl/ContractServiceImpl.java');
      const backendInterface = read('../edu-server/edu-finance/src/main/java/com/edu/finance/service/ContractService.java');
      return (
        frontendContent.includes("return unwrap<boolean>(await http.put<unknown>(`/finance/contract/${id}`, {") &&
        frontendContent.includes('type: toBackendContractType(data.type),') &&
        backendController.includes('public R<Boolean> updateWithId(@PathVariable Long id, @RequestBody ContractFormDTO contract) {') &&
        backendController.includes('return R.ok(contractService.updateContract(id, contract));') &&
        backendInterface.includes('boolean updateContract(Long id, ContractFormDTO contractForm);') &&
        backendService.includes('public boolean updateContract(Long id, ContractFormDTO contractForm) {') &&
        backendService.includes('contractItemMapper.delete(') &&
        (
          backendService.includes('item.setContractId(contractId);') ||
          backendService.includes('item.setContractId(contract.getId());')
        )
      );
    },
  },
  {
    name: 'Backend contract item query joins course table so contract detail can resolve course names',
    run() {
      const content = read('../edu-server/edu-finance/src/main/resources/mapper/finance/ContractItemMapper.xml');
      return (
        content.includes('LEFT JOIN tch_course') &&
        (content.includes('as course_name') || content.includes('AS course_name'))
      );
    },
  },
  {
    name: 'Backend class removal accepts leaveDate and uses it instead of always forcing today',
    run() {
      const controllerContent = read('../edu-server/edu-teaching/src/main/java/com/edu/teaching/controller/TeachClassController.java');
      const serviceContent = read('../edu-server/edu-teaching/src/main/java/com/edu/teaching/service/impl/TeachClassServiceImpl.java');
      return (
        controllerContent.includes('@RequestParam(required = false) LocalDate leaveDate') &&
        serviceContent.includes('LocalDate resolvedLeaveDate = leaveDate != null ? leaveDate : LocalDate.now();') &&
        serviceContent.includes('relation.setLeaveDate(resolvedLeaveDate);') &&
        !serviceContent.includes('relation.setLeaveDate(LocalDate.now());')
      );
    },
  },
];

const failures = checks.filter((check) => !check.run());

if (failures.length > 0) {
  console.error('Regression checks failed:');
  for (const failure of failures) {
    console.error(`- ${failure.name}`);
  }
  process.exit(1);
}

console.log(`Regression checks passed: ${checks.length}`);
