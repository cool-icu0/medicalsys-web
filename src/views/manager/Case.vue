<template>
	<div>
		<div class="search" style="margin-bottom: 10px;">
			<el-input placeholder="请输入ID查询" style="width: 200px; margin-right: 20px;" v-model="SearchKey"></el-input>
			<el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
			<!-- <el-button type="primary" plain style="margin-left: 10px" @click="">新增</el-button> -->
		</div>
		<div class="card">
			<el-table :data="casesCompute" style="width: 100%" @sort-change="handleSortChange">
				<el-table-column prop="id" label="序号" width="80"></el-table-column>
				<el-table-column prop="userId" label="用户ID" sortable></el-table-column>
				<el-table-column prop="medicalCondition" label="症状"></el-table-column>
				<el-table-column :formatter="formatDate" prop="diagnosisDate" label="就诊日期"></el-table-column>
				<el-table-column prop="treatment" label="医嘱"></el-table-column>
				<el-table-column prop="doctorName" label="就诊医生"></el-table-column>
				<el-table-column label="操作" width="180" align="center">
					<template v-slot="scope">
						<el-button plain type="primary" @click="handleEdit(scope.row)" size="mini">编辑</el-button>
						<!-- <el-button plain type="danger" size="mini" @click=del(scope.row.id)>删除</el-button> -->
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
					:page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next" :total="total">
				</el-pagination>
				<el-dialog title="信息" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false"
					destroy-on-close>
					<el-form label-width="100px" style="padding-right: 20px" :model="form" :rules="rules" ref="formRef">
						<el-row>
							<el-col :span="12">
								<div><el-form-item prop="userId" label="用户ID">
										<el-input v-model="form.userId" autocomplete="off" disabled></el-input>
									</el-form-item></div>
							</el-col>
							<el-col :span="12">
								<div><el-form-item prop="doctorName" label="就诊医生">
										<el-select v-model="form.doctorName" placeholder="请选择医生" style="width: 100%">
										  <el-option
										      v-for="item in doctorData"
										      :key="item.id"
										      :label="item.doctorName"
										      :value="item.doctorName">
										  </el-option>
										</el-select>
									</el-form-item></div>
							</el-col>
						</el-row>
						<el-form-item prop="treatment" label="医嘱">
							<el-input type="textarea" :rows="5" v-model="form.treatment" autocomplete="off"></el-input>
						</el-form-item>
						<el-row>
							<el-col :span="12">
								<div><el-form-item prop="diagnosisDate" label="就诊时间">
										<el-date-picker v-model="form.diagnosisDate" align="right" type="date"
											placeholder="选择日期" :picker-options="pickerOptions">
										</el-date-picker>
									</el-form-item></div>
							</el-col>
							<el-col :span="12">
								<div><el-form-item prop="medicalCondition" label="症状">
										<el-input v-model="form.medicalCondition" autocomplete="off"></el-input>
									</el-form-item></div>
							</el-col>
						</el-row>
					</el-form>
					<div slot="footer" class="dialog-footer">
						<el-button @click="fromVisible = false">取 消</el-button>
						<el-button type="primary" @click="save">确 定</el-button>
					</div>
				</el-dialog>
			</div>
		</div>
	</div>

</template>

<script>
	export default {
		data() {
			return {
				doctorData:[],
				nowDate: null,
				tableData: [],
				SearchKey: '',
				pageNum: 1,
				pageSize: 8,
				total: 0, // 添加 total 属性
				fromVisible: false,
				form: {},
				pickerOptions: {
					disabledDate(time) {
						return time.getTime() > Date.now();
					},
					shortcuts: [{
						text: '今天',
						onClick(picker) {
							picker.$emit('pick', new Date());
						}
					}, {
						text: '昨天',
						onClick(picker) {
							const date = new Date();
							date.setTime(date.getTime() - 3600 * 1000 * 24);
							picker.$emit('pick', date);
						}
					}, {
						text: '一周前',
						onClick(picker) {
							const date = new Date();
							date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
							picker.$emit('pick', date);
						}
					}]
				},
			}
		},
		computed: {
			casesCompute: function() {
				if (this.tableData.length > 0) {
					return this.tableData.filter(item => {
						return ("" + item.userId).includes(this.SearchKey)
					})
				} else {
					return []
				}
			}
		},
		mounted() {
			this.fetchCases();
			this.loadDoctor();
		},
		methods: {
			fetchCases() {
				this.$request.get(
						`/api/v1/mediHistory/allWaterFreePager2?pageNum=${this.pageNum}&pageSize=${this.pageSize}`)
					.then(res => {
						console.log(res);
						this.tableData = res.data?.list
						this.total = res.data?.total
					})
			},
			handleEdit(row) {
				this.fromVisible = true
				this.form = JSON.parse(JSON.stringify(row))

			},
			save(){
				this.$request.post('/api/v1/mediHistory/updateMedicalHistory',this.form).then(res =>{
					if (res.code == 200) {
						this.$message.success('修改成功')
						this.load()
						this.fromVisible = false
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			reset() {
				this.SearchKey = ''
			},
			loadDoctor() {
			  this.$request.get('/api/v1/doctor/selectAllDoctorInfo').then(res => {
			    if (res.code == 200) {
			      this.doctorData = res.data
			    } else {
			      this.$message.error(res.msg)
			    }
			  })
			},
			gettime() {
				const now = new Date();
				const year = now.getFullYear(); // 获取四位数年份
				const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以+1，并确保两位数
				const day = now.getDate().toString().padStart(2, '0'); // 确保天为两位数
				this.nowDate = `${year}-${month}-${day}`; //T${hours}:${minutes}:${seconds}.${milliseconds}+08:00
			},
			formatDate(row, column) {
				const value = row[column.property];
				if (!value) return '';

				const date = new Date(value);
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');

				return `${year}-${month}-${day}`; // 返回 "xxxx-xx-xx"
			},
			load(pageNum) { // 分页查询
				if (pageNum) this.pageNum = pageNum
				this.$request.get('/api/v1/mediHistory/allWaterFreePager2', {
					params: {
						pageNum: this.pageNum,
						pageSize: this.pageSize,
					}
				}).then(res => {
					this.tableData = res.data?.list
					this.total = res.data?.total
				})
			},
			handleCurrentChange(pageNum) {
				this.load(pageNum)
			},
		}
	}
</script>

<style>
</style>